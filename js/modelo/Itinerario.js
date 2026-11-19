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
 *   compartido  false: solo lo ve quien lo creó; true: lo ve todo el profesorado
 *               (pero solo lo edita quien lo creó)
 *   sesiones    [{ id, fecha: 'AAAA-MM-DD', actividadId (o '' si aún no tiene), nota }]
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
   * Los itinerarios que puede ver esa persona: los suyos y los compartidos,
   * ordenados por curso (el más reciente primero) y nombre. Se piden en dos
   * consultas porque Firestore rechaza las que podrían devolver algo prohibido.
   */
  static async cargarVisibles(baseDatos, usuario) {
    const [mios, compartidos] = await Promise.all([
      baseDatos.leerColeccion('itinerarios', { campo: 'propietario', valor: usuario.correo }),
      baseDatos.leerColeccion('itinerarios', { campo: 'compartido', valor: true }),
    ]);
    const porId = new Map([...mios, ...compartidos].map((d) => [d.id, new Itinerario(d)]));
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
    return errores;
  }
}
