/*
 * calendarioHtml.js
 * -----------------
 * Calendario pequeño con los 12 meses del curso (de septiembre a agosto),
 * con marcados los meses en que se puede hacer una actividad. Se usa en
 * la tabla de la portada y en la ficha.
 *
 *   S O N D E F M A M J J A
 *   ■ ■ □ □ □ □ ■ ■ □ □ □ □
 */

import { INICIALES_MESES, MESES_CURSO, nombreMes, textoMeses } from '../modelo/calendario.js';

export function calendarioHtml(meses) {
  if (meses.length === 0) {
    return '<span class="sin-dato">—</span>';
  }
  const celdas = MESES_CURSO.map((mes) => {
    const activo = meses.includes(mes);
    return `<span class="calendario-mes${activo ? ' activo' : ''}" title="${nombreMes(mes)}">${INICIALES_MESES[mes - 1]}</span>`;
  }).join('');
  const texto = textoMeses(meses);
  return `<span class="calendario" role="img" aria-label="${texto}" title="${texto}">${celdas}</span>`;
}
