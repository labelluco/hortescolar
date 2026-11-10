/*
 * BaseDatosLocal
 * --------------
 * Modo 'local': lee las colecciones de los ficheros datos/{coleccion}.json.
 * Cada fichero es un array de documentos con un campo "id".
 *
 * Los datos son públicos y pocos (unas 100 actividades), así que se leen
 * enteros con fetch() y se guardan en memoria mientras dura la página.
 */

export class BaseDatosLocal {
  constructor() {
    this.colecciones = new Map(); // nombre → promesa del array
  }

  leerColeccion(nombre) {
    if (!this.colecciones.has(nombre)) {
      this.colecciones.set(nombre, this.descargar(nombre));
    }
    return this.colecciones.get(nombre);
  }

  async leerDocumento(coleccion, id) {
    const documentos = await this.leerColeccion(coleccion);
    return documentos.find((documento) => documento.id === id) ?? null;
  }

  direccionImagen(ruta) {
    return `datos/${ruta}`;
  }

  async descargar(nombre) {
    const respuesta = await fetch(`datos/${nombre}.json`);
    if (!respuesta.ok) {
      throw new Error(`No se ha podido leer datos/${nombre}.json (${respuesta.status})`);
    }
    return respuesta.json();
  }
}
