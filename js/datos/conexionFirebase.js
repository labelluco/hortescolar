/*
 * conexionFirebase.js
 * -------------------
 * Abre una sola vez la conexión con Firebase y la comparten
 * BaseDatosFirebase (Firestore) y Sesion (Authentication). El SDK se carga
 * desde gstatic, sin npm, y solo cuando hace falta: en el modo 'local' no
 * se descarga nada.
 *
 * Devuelve { auth, bd, autenticacion, firestore }, donde los dos últimos son
 * los módulos del SDK con sus funciones (getDocs, signOut…).
 */

import { CONFIG_FIREBASE, VERSION_SDK } from './configFirebase.js';

let conexion = null; // promesa, para no abrirla dos veces

export function obtenerFirebase() {
  if (!conexion) {
    conexion = abrir();
  }
  return conexion;
}

async function abrir() {
  if (!CONFIG_FIREBASE) {
    throw new Error('Falta rellenar js/datos/configFirebase.js');
  }
  const base = `https://www.gstatic.com/firebasejs/${VERSION_SDK}`;
  const [aplicacion, autenticacion, firestore] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);

  const app = aplicacion.initializeApp(CONFIG_FIREBASE);
  // La sesión se recuerda en este navegador hasta que se pulsa «Salir».
  const auth = autenticacion.getAuth(app);
  const bd = firestore.getFirestore(app);
  return { auth, bd, autenticacion, firestore };
}
