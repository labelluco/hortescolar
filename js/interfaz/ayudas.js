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

/** Lista HTML (<ul> u <ol>) a partir de un array de textos. */
export function listaHtml(elementos, etiqueta = 'ul') {
  return `<${etiqueta}>${elementos.map((e) => `<li>${escaparHtml(e)}</li>`).join('')}</${etiqueta}>`;
}
