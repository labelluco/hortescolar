/*
 * configFirebase.js
 * -----------------
 * Datos de conexión del proyecto de Firebase «huerto-escolar-66b3d»
 * (Firestore en europe-southwest1, Madrid; plan gratuito Spark).
 *
 * No son secretos: cualquier app web de Firebase los lleva en su código.
 * Lo que protege los datos son las reglas de seguridad (firestore.rules:
 * leer, cualquiera; escribir, solo con sesión) y que nadie puede
 * registrarse por su cuenta: las cuentas se crean en la consola.
 */

export const CONFIG_FIREBASE = {
  apiKey: 'AIzaSyBr2Cw_rZB4liA9ZLgYVj-mA36JfAdH3Xg',
  authDomain: 'huerto-escolar-66b3d.firebaseapp.com',
  projectId: 'huerto-escolar-66b3d',
  storageBucket: 'huerto-escolar-66b3d.firebasestorage.app',
  messagingSenderId: '864005411779',
  appId: '1:864005411779:web:da2c11655a744830b86376',
};

// Versión del SDK web de Firebase que se carga desde gstatic (sin npm).
export const VERSION_SDK = '11.0.2';
