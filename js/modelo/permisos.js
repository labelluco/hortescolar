/*
 * permisos.js
 * -----------
 * Qué puede hacer cada persona con una actividad. Hay dos tipos de usuario
 * del profesorado:
 *
 *   revisor  publica directamente, aprueba las pendientes y puede editar o
 *            borrar cualquier actividad.
 *   normal   crea actividades, que quedan pendientes de revisión, y puede
 *            editar o borrar las suyas mientras están pendientes.
 *
 * Sin sesión solo se pueden ver las actividades publicadas.
 *
 * Estas funciones solo deciden qué botones se enseñan. Quien de verdad lo
 * impide son las reglas de seguridad de Firestore (firestore.rules), que
 * dicen lo mismo.
 *
 * El usuario es el que devuelve Sesion.usuario(): { correo, revisor } o null.
 */

import { PENDIENTE, PUBLICADA } from './Actividad.js';

export function puedeEditar(usuario, actividad) {
  if (!usuario) return false;
  if (usuario.revisor) return true;
  return !actividad.estaPublicada && actividad.esDe(usuario.correo);
}

export function puedeBorrar(usuario, actividad) {
  return puedeEditar(usuario, actividad);
}

export function puedeAprobar(usuario, actividad) {
  return Boolean(usuario?.revisor) && !actividad.estaPublicada;
}

/** El estado con que queda una actividad al guardarla esa persona. */
export function estadoAlGuardar(usuario) {
  return usuario?.revisor ? PUBLICADA : PENDIENTE;
}
