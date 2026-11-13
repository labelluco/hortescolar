/*
 * Actividad
 * ---------
 * Una actividad del huerto escolar.
 *
 *   id          identificador
 *   recurso     lo que hay en el huerto y da pie a la actividad ("Huellas de animales")
 *   titulo      nombre de la actividad ("Trampas de huellas")
 *   categoria   id de su categoría principal (ver categorias.js)
 *   etapas      etapas para las que sirve, en el orden de ETAPAS. Cada una:
 *                 { etapa, saberes: [textos], adaptacion: texto }
 *               Los saberes básicos son los del currículo de Aragón para
 *               esa etapa, y la adaptación explica qué cambia en ella.
 *   descripcion resumen de la actividad
 *   objetivos   lista de textos
 *   materiales  lista de textos
 *   desarrollo  pasos de la actividad, en orden (lista de textos)
 *   notas       notas y precauciones (lista de textos)
 *   duracion    texto libre ("2 sesiones de 50 min")
 *   estaciones  estaciones en que se puede hacer, en el orden de ESTACIONES
 *   epoca       nota sobre la época (texto libre: "sembrar en la luna menguante de diciembre")
 *   imagenes    hasta 10, en orden: { id, texto } (colección 'imagenes')
 *               o { ruta, texto } (fichero en datos/, solo los ejemplos)
 *   estado      'publicada' (la ve todo el mundo) o 'pendiente' (de revisión:
 *               solo la ve el profesorado con sesión)
 *   creada      { por: correo, el: fecha ISO }: quién la creó
 *   modificada  { por: correo, el: fecha ISO } del último cambio
 *   revisada    { por: correo, el: fecha ISO }: qué revisor la aprobó
 *
 * Los correos solo se enseñan al profesorado con sesión.
 */

import { areaCorta, partirSaber } from './saber.js';
import { categoriaPorId, posicionCategoria } from './categorias.js';
import { ESTACIONES, estacionesDeMeses, posicionEstacion, textoEstaciones } from './estaciones.js';

export const MAXIMO_IMAGENES = 10;

/** Estados de una actividad. */
export const PUBLICADA = 'publicada';
export const PENDIENTE = 'pendiente';

/** Las etapas posibles, en orden. */
export const ETAPAS = [
  'Infantil',
  'Primaria · 1.er ciclo',
  'Primaria · 2.º ciclo',
  'Primaria · 3.er ciclo',
];

export class Actividad {
  constructor(datos = {}) {
    this.id = datos.id ?? null;
    this.recurso = datos.recurso ?? '';
    this.titulo = datos.titulo ?? '';
    this.categoria = datos.categoria ?? '';
    this.etapas = Actividad.leerEtapas(datos);
    this.descripcion = datos.descripcion ?? '';
    this.objetivos = datos.objetivos ?? [];
    this.materiales = datos.materiales ?? [];
    this.desarrollo = datos.desarrollo ?? [];
    this.notas = datos.notas ?? [];
    this.duracion = datos.duracion ?? '';
    this.estaciones = Actividad.leerEstaciones(datos);
    this.epoca = datos.epoca ?? '';
    this.imagenes = datos.imagenes ?? [];
    // Las actividades de antes de haber revisión no tienen estado: estaban publicadas
    this.estado = datos.estado === PENDIENTE ? PENDIENTE : PUBLICADA;
    this.creada = datos.creada ?? null;
    this.modificada = datos.modificada ?? null;
    this.revisada = datos.revisada ?? null;
  }

  get estaPublicada() {
    return this.estado === PUBLICADA;
  }

  /** ¿La creó esa persona (correo)? */
  esDe(correo) {
    return Boolean(correo) && this.creada?.por === correo;
  }

  /**
   * Las etapas de un documento, ordenadas. Admite también el formato
   * antiguo (una sola "etapa" de texto y una lista "saberes").
   */
  static leerEtapas(datos) {
    let etapas = datos.etapas;
    if (!etapas && datos.etapa) {
      etapas = [{ etapa: datos.etapa, saberes: datos.saberes ?? [], adaptacion: '' }];
    }
    return (etapas ?? [])
      .map((e) => ({ etapa: e.etapa, saberes: e.saberes ?? [], adaptacion: e.adaptacion ?? '' }))
      .sort((a, b) => Actividad.posicionEtapa(a.etapa) - Actividad.posicionEtapa(b.etapa));
  }

  /** Posición de una etapa en ETAPAS (las desconocidas, al final). */
  static posicionEtapa(etapa) {
    const posicion = ETAPAS.indexOf(etapa);
    return posicion >= 0 ? posicion : ETAPAS.length;
  }

  /**
   * Las estaciones de un documento, sin repetir y en orden. Admite también
   * el formato anterior, con meses (1 a 12).
   */
  static leerEstaciones(datos) {
    const estaciones = datos.estaciones ?? estacionesDeMeses(datos.meses ?? []);
    return ESTACIONES.filter((estacion) => estaciones.includes(estacion));
  }

  static desdeDocumento(documento) {
    return new Actividad(documento);
  }

  /** Lee una actividad por su id; null si no existe. */
  static async leer(id, baseDatos) {
    const documento = await baseDatos.leerDocumento('actividades', id);
    return documento ? Actividad.desdeDocumento(documento) : null;
  }

  /** Los datos que se guardan en la base de datos (todo menos el id). */
  aDocumento() {
    return {
      recurso: this.recurso,
      titulo: this.titulo,
      categoria: this.categoria,
      etapas: this.etapas,
      descripcion: this.descripcion,
      objetivos: this.objetivos,
      materiales: this.materiales,
      desarrollo: this.desarrollo,
      notas: this.notas,
      duracion: this.duracion,
      estaciones: this.estaciones,
      epoca: this.epoca,
      imagenes: this.imagenes,
      estado: this.estado,
      creada: this.creada,
      modificada: this.modificada,
      revisada: this.revisada,
    };
  }

  /** Lista de textos que faltan para poder guardarla (vacía si está bien). */
  errores() {
    const errores = [];
    if (!this.titulo) errores.push('Falta el nombre de la actividad.');
    if (!this.recurso) errores.push('Falta el recurso.');
    if (!categoriaPorId(this.categoria)) errores.push('Falta la categoría.');
    if (this.etapas.length === 0) errores.push('Marca al menos una etapa.');
    if (this.imagenes.length > MAXIMO_IMAGENES) errores.push(`Como mucho, ${MAXIMO_IMAGENES} imágenes.`);
    return errores;
  }

  /** Nombre de su categoría ('' si no tiene). */
  get nombreCategoria() {
    return categoriaPorId(this.categoria)?.nombre ?? '';
  }

  /** Para ordenar por categoría, en el orden de CATEGORIAS. */
  get posicionCategoria() {
    return posicionCategoria(this.categoria);
  }

  /** Nombres de las etapas, en orden. */
  get nombresEtapas() {
    return this.etapas.map((e) => e.etapa);
  }

  /** ¿Sirve para esa etapa? */
  tieneEtapa(etapa) {
    return this.nombresEtapas.includes(etapa);
  }

  /**
   * Saberes básicos de una etapa, o de todas (sin repetir) si no se indica.
   */
  saberesDe(etapa = null) {
    const elegidas = etapa ? this.etapas.filter((e) => e.etapa === etapa) : this.etapas;
    return [...new Set(elegidas.flatMap((e) => e.saberes))];
  }

  /** Áreas (nombre corto) de los saberes de una etapa o de todas, sin repetir. */
  areasDe(etapa = null) {
    return [...new Set(this.saberesDe(etapa).map((s) => areaCorta(partirSaber(s).area)).filter(Boolean))];
  }

  /** ¿Se puede hacer en esa estación? */
  esDeEstacion(estacion) {
    return this.estaciones.includes(estacion);
  }

  /** Las estaciones en texto ("Todo el año", "Otoño y primavera"…). */
  get estacionesEnTexto() {
    return textoEstaciones(this.estaciones);
  }

  /** Para ordenar por época: la primera estación dentro del curso (otoño primero). */
  get primeraEstacion() {
    return this.estaciones.length ? posicionEstacion(this.estaciones[0]) : null;
  }

  /** Los saberes en un solo texto, para buscar y ordenar. */
  get saberesEnTexto() {
    return this.saberesDe().join(' · ');
  }

  /** Las etapas en un solo texto, para buscar. */
  get etapasEnTexto() {
    return this.nombresEtapas.join(' · ');
  }
}
