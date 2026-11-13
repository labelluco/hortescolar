/*
 * estacionesHtml.js
 * -----------------
 * Las cuatro estaciones en pequeño (otoño, invierno, primavera y verano),
 * con marcadas aquellas en que se puede hacer una actividad. Se usa en la
 * tabla de actividades y en la ficha.
 *
 *   O I P V
 *   ■ □ ■ □   → otoño y primavera
 */

import { ESTACIONES, textoEstaciones } from '../modelo/estaciones.js';
import { escaparHtml } from './ayudas.js';

export function estacionesHtml(estaciones) {
  if (estaciones.length === 0) {
    return '<span class="sin-dato">—</span>';
  }
  const celdas = ESTACIONES.map((estacion) => {
    const activa = estaciones.includes(estacion);
    return `<span class="estacion${activa ? ' activa' : ''}" title="${escaparHtml(estacion)}">${estacion[0]}</span>`;
  }).join('');
  const texto = escaparHtml(textoEstaciones(estaciones));
  return `<span class="estaciones" role="img" aria-label="${texto}" title="${texto}">${celdas}</span>`;
}
