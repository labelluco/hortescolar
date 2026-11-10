/*
 * saber.js
 * --------
 * Los saberes básicos se escriben con el área y el bloque delante, tal
 * como vienen en el currículo de Aragón:
 *
 *   "Ciencias de la Naturaleza (A.2): Las adaptaciones de los seres vivos…"
 *   "Educación Plástica y Visual: Medios, soportes y materiales…"
 *
 * Estas funciones separan el área del texto, para que la tabla de la
 * portada pueda enseñar solo las áreas sin saturarse.
 */

// Nombres cortos de las áreas con nombre largo (el resto se deja igual)
const AREAS_CORTAS = {
  'Descubrimiento y Exploración del Entorno': 'Descubrimiento del entorno',
  'Comunicación y Representación de la Realidad': 'Comunicación y representación',
  'Crecimiento en Armonía': 'Crecimiento en armonía',
  'Educación Plástica y Visual': 'Plástica',
};

/**
 * { area, bloque, texto } de un saber. Si no lleva área delante,
 * el área queda vacía y el texto es el saber entero.
 */
export function partirSaber(saber) {
  const partes = /^([^:(]+?)\s*(?:\(([^)]*)\))?:\s*(.+)$/s.exec(saber);
  if (!partes) {
    return { area: '', bloque: '', texto: saber };
  }
  return { area: partes[1].trim(), bloque: partes[2] ?? '', texto: partes[3] };
}

/** Nombre corto del área, para la tabla. */
export function areaCorta(area) {
  return AREAS_CORTAS[area] ?? area;
}
