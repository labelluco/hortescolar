/*
 * categorias.js
 * -------------
 * Las categorías de las actividades. Cada actividad tiene una categoría
 * principal, que se ve en la tabla con su color.
 *
 * Para añadir una categoría:
 *   1. Añadirla aquí, con un id sin espacios ni tildes.
 *   2. Darle color en css/estilos.css: la variable --cat-{id} en :root
 *      (los colores de la paleta se distinguen bien también con daltonismo).
 */

export const CATEGORIAS = [
  { id: 'cultivo', nombre: 'Cultivo' },
  { id: 'experimentacion', nombre: 'Experimentación' },
  { id: 'tecnologia', nombre: 'Tecnología y programación' },
  { id: 'naturaleza', nombre: 'Naturaleza y biodiversidad' },
  { id: 'sostenibilidad', nombre: 'Sostenibilidad' },
  { id: 'arte', nombre: 'Arte y creatividad' },
  { id: 'cocina', nombre: 'Alimentación y cocina' },
];

/** La categoría con ese id, o null si no existe. */
export function categoriaPorId(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id) ?? null;
}

/** Posición en la lista (para ordenar); las desconocidas, al final. */
export function posicionCategoria(id) {
  const posicion = CATEGORIAS.findIndex((categoria) => categoria.id === id);
  return posicion >= 0 ? posicion : CATEGORIAS.length;
}
