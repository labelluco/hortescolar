/*
 * Itinerario
 * ----------
 * La programación del huerto para una etapa: una serie de sesiones (días con
 * huerto) y, en cada una, la actividad que se hará. Puede ser de todo el
 * curso, de un trimestre o de un mes.
 *
 *   id          identificador
 *   nombre      «Huerto de otoño», «Programación 2.º ciclo»…
 *   etapa       una de ETAPAS (ver Actividad.js): solo se eligen actividades de esa etapa
 *   curso       curso escolar, «2026-27»
 *   descripcion texto libre (opcional)
 *   compartido  true: lo ve todo el profesorado
 *   compartidoCon  [correos]: si no es de todos, las personas que lo ven.
 *               Con compartido false y la lista vacía, solo lo ve quien lo
 *               creó. En todos los casos, solo lo edita quien lo creó.
 *   sesiones    [{ id, fecha: 'AAAA-MM-DD', actividadId (o '' si aún no tiene), nota }]
 *               La nota puede ser larga, con párrafos: qué se hace ese día.
 *               Una actividad puede ocupar varias sesiones, seguidas o no
 *               (el biodigestor: montaje, observaciones, filtrar y abonar).
 *   creada      { por: correo, el: fecha ISO }: quién lo creó (su propietario)
 *   modificada  { por: correo, el: fecha ISO } del último cambio
 */

import { inicioCurso, sumarDias } from './fechas.js';

export class Itinerario {
  constructor(datos = {}) {
    this.id = datos.id ?? null;
    this.nombre = datos.nombre ?? '';
    this.etapa = datos.etapa ?? '';
    this.curso = datos.curso ?? '';
    this.descripcion = datos.descripcion ?? '';
    this.compartido = Boolean(datos.compartido);
    this.compartidoCon = this.compartido ? [] : (datos.compartidoCon ?? []);
    this.sesiones = (datos.sesiones ?? []).map((s) => ({
      id: s.id ?? Itinerario.nuevoIdSesion(),
      fecha: s.fecha,
      actividadId: s.actividadId ?? '',
      nota: s.nota ?? '',
    }));
    this.ordenarSesiones();
    this.creada = datos.creada ?? null;
    this.modificada = datos.modificada ?? null;
  }

  static nuevoIdSesion() {
    return crypto.randomUUID().slice(0, 8);
  }

  /** Lee un itinerario por su id; null si no existe (o no se puede ver). */
  static async leer(id, baseDatos) {
    const documento = await baseDatos.leerDocumento('itinerarios', id);
    return documento ? new Itinerario(documento) : null;
  }

  /**
   * Los itinerarios que puede ver esa persona: los suyos, los compartidos
   * con todos y los compartidos con ella, ordenados por curso (el más
   * reciente primero) y nombre. Se piden en tres consultas porque Firestore
   * rechaza las que podrían devolver algo prohibido.
   */
  static async cargarVisibles(baseDatos, usuario) {
    const listas = await Promise.all([
      baseDatos.leerColeccion('itinerarios', { campo: 'propietario', valor: usuario.correo }),
      baseDatos.leerColeccion('itinerarios', { campo: 'compartido', valor: true }),
      baseDatos.leerColeccion('itinerarios', { campo: 'compartidoCon', contiene: usuario.correo }),
    ]);
    const porId = new Map(listas.flat().map((d) => [d.id, new Itinerario(d)]));
    return [...porId.values()].sort((a, b) =>
      b.curso.localeCompare(a.curso) || a.nombre.localeCompare(b.nombre, 'es'));
  }

  /** El correo de quien lo creó. */
  get propietario() {
    return this.creada?.por ?? '';
  }

  esDe(correo) {
    return Boolean(correo) && this.propietario === correo;
  }

  /** Con quién se comparte: 'nadie', 'todos' o 'algunos' (los de compartidoCon). */
  get conQuien() {
    if (this.compartido) return 'todos';
    return this.compartidoCon.length ? 'algunos' : 'nadie';
  }

  /** Cambia con quién se comparte; los correos solo cuentan con 'algunos'. */
  compartirCon(conQuien, correos = []) {
    this.compartido = conQuien === 'todos';
    this.compartidoCon = conQuien === 'algunos'
      ? [...new Set(correos.map((c) => c.trim().toLowerCase()).filter(Boolean))]
        .filter((c) => c !== this.propietario)
      : [];
  }

  /** ¿Lo puede ver esa persona? (quien lo creó, o si está compartido con ella) */
  loVe(correo) {
    return Boolean(correo)
      && (this.compartido || this.esDe(correo) || this.compartidoCon.includes(correo));
  }

  ordenarSesiones() {
    this.sesiones.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /** Añade sesiones vacías en esas fechas (las que ya estaban no se repiten). */
  anadirFechas(fechas) {
    const ocupadas = new Set(this.sesiones.map((s) => s.fecha));
    for (const fecha of fechas) {
      if (!ocupadas.has(fecha)) {
        this.sesiones.push({ id: Itinerario.nuevoIdSesion(), fecha, actividadId: '', nota: '' });
        ocupadas.add(fecha);
      }
    }
    this.ordenarSesiones();
  }

  quitarSesion(idSesion) {
    this.sesiones = this.sesiones.filter((s) => s.id !== idSesion);
  }

  sesion(idSesion) {
    return this.sesiones.find((s) => s.id === idSesion) ?? null;
  }

  /** Primera y última fecha, o null si no hay sesiones. */
  get primeraFecha() { return this.sesiones[0]?.fecha ?? null; }
  get ultimaFecha() { return this.sesiones.at(-1)?.fecha ?? null; }

  /** Cuántas sesiones tienen ya actividad. */
  get sesionesConActividad() {
    return this.sesiones.filter((s) => s.actividadId).length;
  }

  /**
   * Qué sesión es cada una dentro de su actividad, por orden de fecha:
   * Map idSesion → { numero, total }. El biodigestor en tres fechas sale
   * como 1/3, 2/3 y 3/3.
   */
  numeracion() {
    const porActividad = new Map(); // actividadId → [idSesion]
    for (const sesion of this.sesiones) {
      if (!sesion.actividadId) continue;
      porActividad.set(sesion.actividadId, [...(porActividad.get(sesion.actividadId) ?? []), sesion.id]);
    }
    const numeros = new Map();
    for (const ids of porActividad.values()) {
      ids.forEach((id, posicion) => numeros.set(id, { numero: posicion + 1, total: ids.length }));
    }
    return numeros;
  }

  /**
   * Una copia para otra persona o para otro curso. Si el curso cambia, las
   * fechas se mueven semanas enteras (52 por año) para que caigan en el
   * mismo día de la semana: hay que revisar luego los festivos.
   */
  copiar(nombre, curso) {
    const semanas = 52 * (inicioCurso(curso) - inicioCurso(this.curso));
    return new Itinerario({
      nombre,
      etapa: this.etapa,
      curso,
      descripcion: this.descripcion,
      compartido: false,
      compartidoCon: [],
      sesiones: this.sesiones.map((s) => ({ ...s, id: null, fecha: sumarDias(s.fecha, semanas * 7) })),
    });
  }

  /** Los datos que se guardan en la base de datos (todo menos el id). */
  aDocumento() {
    return {
      nombre: this.nombre,
      etapa: this.etapa,
      curso: this.curso,
      descripcion: this.descripcion,
      compartido: this.compartido,
      compartidoCon: this.compartidoCon,
      // El propietario va aparte para poder buscar «mis itinerarios»
      propietario: this.propietario,
      sesiones: this.sesiones,
      creada: this.creada,
      modificada: this.modificada,
    };
  }

  /** Lista de textos que faltan para poder guardarlo (vacía si está bien). */
  errores() {
    const errores = [];
    if (!this.nombre) errores.push('Falta el nombre del itinerario.');
    if (!this.etapa) errores.push('Falta la etapa.');
    if (!/^\d{4}-\d{2}$/.test(this.curso)) errores.push('El curso se escribe así: 2026-27.');
    if (this.conQuien === 'algunos' && this.compartidoCon.length > 50) {
      errores.push('Se puede compartir con 50 personas como mucho.');
    }
    const malos = this.compartidoCon.filter((c) => !/^[^\s@,;]+(@[^\s@,;]+)?$/.test(c));
    if (malos.length) errores.push(`Correos que no se entienden: ${malos.join(', ')}.`);
    return errores;
  }
}
