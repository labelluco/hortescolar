/*
 * BaseDatosFirebase
 * -----------------
 * Modo 'firebase': lee y escribe en Firestore. Cada documento de Firestore
 * se devuelve como un objeto normal con su "id".
 *
 * Leer puede cualquiera; escribir, solo el profesorado con sesión iniciada
 * (lo comprueban las reglas de seguridad, ver firestore.rules).
 */

import { obtenerFirebase } from './conexionFirebase.js';

export class BaseDatosFirebase {
  async leerColeccion(nombre) {
    const { bd, firestore } = await obtenerFirebase();
    const resultado = await firestore.getDocs(firestore.collection(bd, nombre));
    return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
  }

  async leerDocumento(coleccion, id) {
    const { bd, firestore } = await obtenerFirebase();
    const documento = await firestore.getDoc(firestore.doc(bd, coleccion, id));
    return documento.exists() ? { id: documento.id, ...documento.data() } : null;
  }

  /**
   * Aplica varios cambios de una vez: o se guardan todos o ninguno.
   * Cada operación es { tipo: 'guardar' | 'borrar', coleccion, id, datos }.
   */
  async aplicarCambios(operaciones) {
    const { bd, firestore } = await obtenerFirebase();
    const lote = firestore.writeBatch(bd);
    for (const operacion of operaciones) {
      const referencia = firestore.doc(bd, operacion.coleccion, operacion.id);
      if (operacion.tipo === 'borrar') {
        lote.delete(referencia);
      } else {
        lote.set(referencia, operacion.datos);
      }
    }
    await lote.commit();
  }
}
