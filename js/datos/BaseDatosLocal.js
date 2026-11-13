/*
 * BaseDatosLocal
 * --------------
 * Modo 'local': lee las colecciones de los ficheros datos/{coleccion}.json.
 * Cada fichero es un array de documentos con un campo "id"; si no existe,
 * la colección está vacía.
 *
 * Sirve para probar sin Firebase: los cambios no tocan los ficheros, se
 * guardan en sessionStorage y se pierden al cerrar la pestaña.
 */

const PREFIJO = 'huerto-local-';

export class BaseDatosLocal {
  constructor() {
    this.colecciones = new Map(); // nombre → promesa del array
  }

  /** Toda la colección, o solo los documentos con { campo: valor } si se indica filtro. */
  async leerColeccion(nombre, filtro = null) {
    if (!this.colecciones.has(nombre)) {
      this.colecciones.set(nombre, this.descargar(nombre));
    }
    const documentos = await this.colecciones.get(nombre);
    return filtro ? documentos.filter((d) => d[filtro.campo] === filtro.valor) : documentos;
  }

  async leerDocumento(coleccion, id) {
    const documentos = await this.leerColeccion(coleccion);
    return documentos.find((documento) => documento.id === id) ?? null;
  }

  async aplicarCambios(operaciones) {
    for (const { tipo, coleccion, id, datos } of operaciones) {
      const documentos = await this.leerColeccion(coleccion);
      const posicion = documentos.findIndex((documento) => documento.id === id);
      if (posicion >= 0) {
        documentos.splice(posicion, 1);
      }
      if (tipo === 'guardar') {
        documentos.push({ id, ...datos });
      }
      sessionStorage.setItem(PREFIJO + coleccion, JSON.stringify(documentos));
    }
  }

  async descargar(nombre) {
    const guardada = sessionStorage.getItem(PREFIJO + nombre);
    if (guardada) {
      return JSON.parse(guardada);
    }
    const respuesta = await fetch(`datos/${nombre}.json`);
    if (respuesta.status === 404) {
      return [];
    }
    if (!respuesta.ok) {
      throw new Error(`No se ha podido leer datos/${nombre}.json (${respuesta.status})`);
    }
    return respuesta.json();
  }
}
