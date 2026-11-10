/*
 * categoriaHtml.js
 * ----------------
 * Etiqueta de la categoría de una actividad: un punto de su color y el
 * nombre (el color nunca va solo, para quien no distingue bien los colores).
 * El color sale de la variable --cat-{id} de css/estilos.css.
 */

import { categoriaPorId } from '../modelo/categorias.js';
import { escaparHtml } from './ayudas.js';

export function categoriaHtml(id) {
  const categoria = categoriaPorId(id);
  if (!categoria) {
    return '';
  }
  return `<span class="categoria" style="--color-categoria: var(--cat-${categoria.id})">`
    + `<span class="categoria-punto" aria-hidden="true"></span>${escaparHtml(categoria.nombre)}</span>`;
}
