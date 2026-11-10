/*
 * configFirebase.js
 * -----------------
 * Datos de conexión del proyecto de Firebase. Se copian de la consola de
 * Firebase (Configuración del proyecto → Tus apps → app web).
 *
 * No son secretos: cualquier app web de Firebase los lleva en su código.
 * Lo que protege los datos son las reglas de seguridad de Firestore.
 *
 * Todavía sin rellenar: mientras tanto, configuracion.js usa el modo 'local'.
 */

export const CONFIG_FIREBASE = null;
// Cuando exista el proyecto, quedará así:
// export const CONFIG_FIREBASE = {
//   apiKey: '…',
//   authDomain: '….firebaseapp.com',
//   projectId: '…',
//   storageBucket: '….firebasestorage.app',
//   messagingSenderId: '…',
//   appId: '…',
// };

// Versión del SDK web de Firebase que se carga desde gstatic (sin npm).
export const VERSION_SDK = '11.0.2';
