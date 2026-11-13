/*
 * ayudas.js
 * ---------
 * Pequeñas funciones comunes a las páginas.
 */

/** Evita que un texto se interprete como HTML al pintarlo con innerHTML. */
export function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Una dirección web dentro de un texto (sin espacios ni comillas)
const DIRECCION_WEB = /https?:\/\/[^\s<>"']+/g;

/**
 * Como escaparHtml, pero las direcciones web (https://…) se convierten en
 * enlaces que se abren en otra pestaña. Los signos de puntuación del final
 * («…pdf.» o «…pdf),») no forman parte del enlace.
 */
export function textoConEnlaces(texto) {
  const original = String(texto ?? '');
  let html = '';
  let desde = 0;
  for (const encontrada of original.matchAll(DIRECCION_WEB)) {
    const direccion = encontrada[0].replace(/[.,;:)]+$/, '');
    html += escaparHtml(original.slice(desde, encontrada.index));
    html += `<a href="${escaparHtml(direccion)}" target="_blank" rel="noopener">${escaparHtml(direccion)}</a>`;
    desde = encontrada.index + direccion.length;
  }
  return html + escaparHtml(original.slice(desde));
}

/** Lista HTML (<ul> u <ol>) a partir de un array de textos (con enlaces). */
export function listaHtml(elementos, etiqueta = 'ul') {
  return `<${etiqueta}>${elementos.map((e) => `<li>${textoConEnlaces(e)}</li>`).join('')}</${etiqueta}>`;
}
