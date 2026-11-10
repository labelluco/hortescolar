/*
 * ListaActividades
 * ----------------
 * Todas las actividades, cargadas de una sola vez, con búsqueda.
 *
 *   const lista = await ListaActividades.cargar(baseDatos);
 *   lista.buscar('huellas', 'recurso');   // solo en la columna Recurso
 *   lista.buscar('multiplica');           // en las cuatro columnas
 */

import { Actividad } from './Actividad.js';
import { coincide } from './texto.js';

// Qué textos de una actividad mira cada opción de "Buscar en".
export const CAMPOS_BUSQUEDA = {
  todo: (a) => [a.recurso, a.titulo, a.saberesEnTexto, a.etapa],
  recurso: (a) => [a.recurso],
  titulo: (a) => [a.titulo],
  saberes: (a) => a.saberes,
  etapa: (a) => [a.etapa],
};

export class ListaActividades {
  constructor(actividades) {
    this.actividades = actividades;
  }

  static async cargar(baseDatos) {
    const documentos = await baseDatos.leerColeccion('actividades');
    return new ListaActividades(documentos.map(Actividad.desdeDocumento));
  }

  get total() {
    return this.actividades.length;
  }

  /**
   * Actividades que contienen el texto (sin distinguir mayúsculas ni tildes).
   * Si el texto lleva varias palabras, tienen que aparecer todas, aunque
   * sea en columnas distintas ("huellas infantil").
   */
  buscar(texto, campo = 'todo') {
    const camposDe = CAMPOS_BUSQUEDA[campo] ?? CAMPOS_BUSQUEDA.todo;
    const palabras = String(texto ?? '').split(/\s+/).filter(Boolean);
    return this.actividades.filter((actividad) =>
      palabras.every((palabra) => coincide(palabra, camposDe(actividad))),
    );
  }

  /** Las distintas etapas que hay, en orden alfabético. */
  etapas() {
    return [...new Set(this.actividades.map((a) => a.etapa).filter(Boolean))].sort();
  }
}
