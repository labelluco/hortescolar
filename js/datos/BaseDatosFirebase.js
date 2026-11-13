/*
 * BaseDatosFirebase
 * -----------------
 * Modo 'firebase': lee y escribe en Firestore. Cada documento de Firestore
 * se devuelve como un objeto normal con su "id".
 *
 * Quién puede leer y escribir cada cosa lo deciden las reglas de seguridad
 * (ver firestore.rules). Sin sesión, solo se pueden leer las actividades
 * publicadas, así que hay que pedirlas con un filtro: Firestore no filtra
 * por su cuenta, rechaza la consulta entera si podría devolver algo prohibido.
 */

import { obtenerFirebase } from './conexionFirebase.js';

export class BaseDatosFirebase {
  /** Toda la colección, o solo los documentos con { campo: valor } si se indica filtro. */
  async leerColeccion(nombre, filtro = null) {
    const { bd, firestore } = await obtenerFirebase();
    let consulta = firestore.collection(bd, nombre);
    if (filtro) {
      consulta = firestore.query(consulta, firestore.where(filtro.campo, '==', filtro.valor));
    }
    const resultado = await firestore.getDocs(consulta);
    return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
  }

  /** Un documento, o null si no existe o no se tiene permiso para verlo. */
  async leerDocumento(coleccion, id) {
    const { bd, firestore } = await obtenerFirebase();
    try {
      const documento = await firestore.getDoc(firestore.doc(bd, coleccion, id));
      return documento.exists() ? { id: documento.id, ...documento.data() } : null;
    } catch (error) {
      if (error.code === 'permission-denied') {
        return null; // por ejemplo, una actividad pendiente vista sin sesión
      }
      throw error;
    }
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
