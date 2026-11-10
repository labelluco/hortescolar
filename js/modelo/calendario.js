/*
 * calendario.js
 * -------------
 * Los meses del año para la época de las actividades. Cada actividad guarda
 * los meses en que se puede hacer como números (1 = enero … 12 = diciembre).
 *
 * Se muestran en el orden del curso escolar, empezando por septiembre.
 */

export const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Inicial de cada mes, para el calendario pequeño de la tabla. */
export const INICIALES_MESES = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Los meses en el orden del curso: 9, 10, 11, 12, 1, 2 … 8. */
export const MESES_CURSO = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

/** Posición de un mes dentro del curso (septiembre = 0). */
export function posicionEnCurso(mes) {
  return MESES_CURSO.indexOf(mes);
}

export function nombreMes(mes) {
  return NOMBRES_MESES[mes - 1];
}

/** El mes de hoy (1 a 12). */
export function mesActual() {
  return new Date().getMonth() + 1;
}

/**
 * Los meses en texto, agrupando los seguidos dentro del curso:
 *   todos         → "Todo el año"
 *   [11, 12, 1]   → "noviembre – enero"
 *   [3, 4, 10]    → "octubre, marzo – abril"
 *   []            → ""
 */
export function textoMeses(meses) {
  if (meses.length === 12) {
    return 'Todo el año';
  }
  const ordenados = [...meses].sort((a, b) => posicionEnCurso(a) - posicionEnCurso(b));
  const tramos = [];
  for (const mes of ordenados) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && posicionEnCurso(mes) === posicionEnCurso(ultimo.hasta) + 1) {
      ultimo.hasta = mes;
    } else {
      tramos.push({ desde: mes, hasta: mes });
    }
  }
  return tramos.map(({ desde, hasta }) => (desde === hasta
    ? nombreMes(desde)
    : `${nombreMes(desde)} – ${nombreMes(hasta)}`)).join(', ');
}
