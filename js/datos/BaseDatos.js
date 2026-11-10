/*
 * BaseDatos
 * ---------
 * Única puerta de la aplicación al almacenamiento. El modelo y las páginas
 * solo usan sus métodos y no saben dónde están los datos.
 *
 * Según configuracion.js, por dentro usa:
 *   - BaseDatosLocal    (modo 'local': ficheros datos/*.json, cambios en memoria)
 *   - BaseDatosFirebase (modo 'firebase': Firestore)
 *
 * Colecciones:
 *   actividades  una por actividad (ver modelo/Actividad.js)
 *   imagenes     una por imagen: { actividadId, datos } con la imagen ya
 *                reducida, como texto "data:image/jpeg;base64,…"
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
   * Guarda y borra varios documentos a la vez (todos o ninguno).
   * Cada operación: { tipo: 'guardar' | 'borrar', coleccion, id, datos }.
   * 'guardar' sustituye el documento entero.
   */
  aplicarCambios(operaciones) {
    return this.almacen.aplicarCambios(operaciones);
  }

  /** Un identificador nuevo para un documento (20 caracteres). */
  nuevoId() {
    return crypto.randomUUID().replaceAll('-', '').slice(0, 20);
  }

  /**
   * Dirección para mostrar una imagen de una actividad:
   *   { id }   → imagen guardada en la colección 'imagenes'
   *   { ruta } → fichero dentro de datos/ (las actividades de ejemplo)
   */
  async direccionImagen(imagen) {
    if (imagen.ruta) {
      return `datos/${imagen.ruta}`;
    }
    const documento = await this.leerDocumento('imagenes', imagen.id);
    return documento?.datos ?? '';
  }
}
