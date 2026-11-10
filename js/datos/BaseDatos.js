/*
 * BaseDatos
 * ---------
 * Única puerta de la aplicación al almacenamiento. El modelo y las páginas
 * solo usan sus métodos de lectura y no saben dónde están los datos.
 *
 * Según configuracion.js, por dentro usa:
 *   - BaseDatosLocal    (modo 'local': ficheros datos/*.json)
 *   - BaseDatosFirebase (modo 'firebase': Firestore)
 *
 * Uso:
 *   const baseDatos = BaseDatos.preparar();
 *   const actividades = await baseDatos.leerColeccion('actividades');
 */

import { ALMACEN } from './configuracion.js';
import { BaseDatosLocal } from './BaseDatosLocal.js';
import { BaseDatosFirebase } from './BaseDatosFirebase.js';

export class BaseDatos {
  constructor(almacen) {
    this.almacen = almacen;
  }

  /** Crea la BaseDatos del modo configurado. */
  static preparar() {
    if (ALMACEN === 'firebase') {
      return new BaseDatos(new BaseDatosFirebase());
    }
    return new BaseDatos(new BaseDatosLocal());
  }

  /** Todos los documentos de una colección (un array de objetos). */
  leerColeccion(nombre) {
    return this.almacen.leerColeccion(nombre);
  }

  /** Un documento por su id, o null si no existe. */
  leerDocumento(coleccion, id) {
    return this.almacen.leerDocumento(coleccion, id);
  }

  /**
   * Dirección completa de una imagen a partir de su ruta guardada
   * (por ejemplo "imagenes/act-001/huella.jpg").
   */
  direccionImagen(ruta) {
    return this.almacen.direccionImagen(ruta);
  }

  // Previsto para más adelante (cuando el profesorado pueda editar):
  //   crearDocumento(coleccion, documento)
  //   modificarDocumento(coleccion, id, cambios)
  //   borrarDocumento(coleccion, id)
}
