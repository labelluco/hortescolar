/*
 * estaciones.js
 * -------------
 * Las estaciones del año para la época de las actividades. Cada actividad
 * guarda las estaciones en que se puede hacer; el momento exacto (por
 * ejemplo, «sembrar en la luna menguante de diciembre») se explica en la
 * nota de época o en el desarrollo.
 *
 * Van en el orden del curso escolar: otoño, invierno, primavera y verano.
 */

export const ESTACIONES = ['Otoño', 'Invierno', 'Primavera', 'Verano'];

/** Posición de una estación en el curso (otoño = 0); las desconocidas, al final. */
export function posicionEstacion(estacion) {
  const posicion = ESTACIONES.indexOf(estacion);
  return posicion >= 0 ? posicion : ESTACIONES.length;
}

/**
 * La estación de una fecha (por defecto, hoy), con los cambios de estación
 * aproximados al día 21 de marzo, 21 de junio, 23 de septiembre y 21 de
 * diciembre.
 */
export function estacionDe(fecha = new Date()) {
  const valor = (fecha.getMonth() + 1) * 100 + fecha.getDate(); // 21 de marzo → 321
  if (valor >= 321 && valor < 621) return 'Primavera';
  if (valor >= 621 && valor < 923) return 'Verano';
  if (valor >= 923 && valor < 1221) return 'Otoño';
  return 'Invierno';
}

/**
 * Las estaciones de una lista de meses (1 a 12). Sirve para leer las
 * actividades que se guardaron con meses antes de pasar a estaciones.
 */
export function estacionesDeMeses(meses) {
  const deMes = (mes) => ESTACIONES[Math.floor(((mes + 3) % 12) / 3)];
  return [...new Set(meses.map(deMes))];
}

/** Las estaciones en texto: «Todo el año», «Invierno», «Otoño y primavera»… */
export function textoEstaciones(estaciones) {
  if (estaciones.length === ESTACIONES.length) {
    return 'Todo el año';
  }
  const nombres = estaciones.map((e, i) => (i === 0 ? e : e.toLowerCase()));
  return nombres.length > 1
    ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
    : nombres.join('');
}
