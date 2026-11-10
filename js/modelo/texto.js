/*
 * texto.js
 * --------
 * Pequeñas funciones de ayuda para trabajar con textos.
 * Las usan las listas para buscar sin tener en cuenta mayúsculas ni tildes
 * ("huellas" encuentra "Huellas", "multiplicacion" encuentra "Multiplicación").
 */

/**
 * Pasa a minúsculas y quita tildes y diéresis (también la ñ → n).
 */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * True si alguno de los campos contiene el texto buscado.
 * Si la búsqueda está vacía, todo coincide.
 */
export function coincide(busqueda, campos) {
  const buscado = normalizarTexto(busqueda);
  if (buscado === '') {
    return true;
  }
  return campos.some((campo) => normalizarTexto(campo).includes(buscado));
}

/**
 * Función para ordenar alfabéticamente en castellano (Á junto a A, Ñ tras N).
 */
export function compararTextos(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'es', { sensitivity: 'base' });
}
