/*
 * Sesion
 * ------
 * Inicio y cierre de sesión del profesorado. Ver las actividades no
 * necesita sesión; crearlas, modificarlas o borrarlas, sí.
 *
 *   'firebase' → Firebase Authentication con correo y contraseña. Las
 *                cuentas se crean en la consola de Firebase (no hay registro
 *                libre). La sesión se recuerda hasta pulsar «Salir».
 *   'local'    → usuario fijo admin / admin, guardado en sessionStorage
 *                (solo para probar).
 *
 * Todos los métodos son asíncronos.
 */

import { ALMACEN } from '../datos/configuracion.js';
import { obtenerFirebase } from '../datos/conexionFirebase.js';

const CLAVE_LOCAL = 'huerto-usuario';

export class Sesion {
  /** El usuario con sesión iniciada ({ correo }) o null. */
  static async usuario() {
    if (ALMACEN !== 'firebase') {
      const correo = sessionStorage.getItem(CLAVE_LOCAL);
      return correo ? { correo } : null;
    }
    const { auth } = await obtenerFirebase();
    await auth.authStateReady(); // espera a saber si había sesión guardada
    return auth.currentUser ? { correo: auth.currentUser.email } : null;
  }

  /** Inicia la sesión; si los datos no son correctos, lanza un Error con un texto para mostrar. */
  static async entrar(correo, contrasena) {
    if (ALMACEN !== 'firebase') {
      if (correo !== 'admin' || contrasena !== 'admin') {
        throw new Error('Usuario o contraseña incorrectos.');
      }
      sessionStorage.setItem(CLAVE_LOCAL, correo);
      return;
    }
    const { auth, autenticacion } = await obtenerFirebase();
    try {
      await autenticacion.signInWithEmailAndPassword(auth, correo, contrasena);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Espera unos minutos y vuelve a probar.');
      }
      throw new Error('Correo o contraseña incorrectos.');
    }
  }

  static async salir() {
    if (ALMACEN !== 'firebase') {
      sessionStorage.removeItem(CLAVE_LOCAL);
      return;
    }
    const { auth, autenticacion } = await obtenerFirebase();
    await autenticacion.signOut(auth);
  }

  /**
   * Para las páginas que solo puede usar el profesorado: si no hay sesión,
   * lleva a la página de acceso (y después vuelve aquí).
   */
  static async proteger() {
    const usuario = await Sesion.usuario();
    if (!usuario) {
      const volver = location.pathname.split('/').pop() + location.search;
      location.replace(`acceso.html?volver=${encodeURIComponent(volver)}`);
      return new Promise(() => {}); // la página no sigue cargando
    }
    return usuario;
  }
}
