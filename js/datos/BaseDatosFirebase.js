/*
 * BaseDatosFirebase
 * -----------------
 * Modo 'firebase': lee las colecciones de Firestore. Cada documento de
 * Firestore se devuelve como un objeto normal con su "id".
 *
 * El SDK de Firebase se carga desde gstatic (sin npm) y solo en este modo.
 */

import { CONFIG_FIREBASE, VERSION_SDK } from './configFirebase.js';

let conexion = null; // promesa, para no abrir Firebase dos veces

async function abrirFirestore() {
  if (!CONFIG_FIREBASE) {
    throw new Error('Falta rellenar js/datos/configFirebase.js');
  }
  const base = `https://www.gstatic.com/firebasejs/${VERSION_SDK}`;
  const [aplicacion, firestore] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  const app = aplicacion.initializeApp(CONFIG_FIREBASE);
  return { bd: firestore.getFirestore(app), fn: firestore };
}

export class BaseDatosFirebase {
  conectar() {
    if (!conexion) {
      conexion = abrirFirestore();
    }
    return conexion;
  }

  async leerColeccion(nombre) {
    const { bd, fn } = await this.conectar();
    const resultado = await fn.getDocs(fn.collection(bd, nombre));
    return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
  }

  async leerDocumento(coleccion, id) {
    const { bd, fn } = await this.conectar();
    const documento = await fn.getDoc(fn.doc(bd, coleccion, id));
    return documento.exists() ? { id: documento.id, ...documento.data() } : null;
  }

  direccionImagen(ruta) {
    // Mientras las imágenes no estén en Firebase Storage, se sirven
    // desde la carpeta datos/ de la propia web.
    return `datos/${ruta}`;
  }
}
