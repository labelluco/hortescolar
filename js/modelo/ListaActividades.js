/*
 * ListaActividades
 * ----------------
 * Todas las actividades, cargadas de una sola vez, con búsqueda.
 *
 *   const lista = await ListaActividades.cargar(baseDatos);
 *   lista.buscar('huellas', 'recurso');                // solo en la columna Recurso
 *   lista.buscar('medida', 'saberes', 'Infantil');     // saberes de Infantil
 *   lista.buscar('compost');                           // en todas las columnas
 */

import { Actividad } from './Actividad.js';
import { coincide } from './texto.js';

// Qué textos de una actividad mira cada opción de "Buscar en".
// Si se ha elegido una etapa, los saberes son solo los de esa etapa.
export const CAMPOS_BUSQUEDA = {
  todo: (a, etapa) => [a.recurso, a.titulo, ...a.saberesDe(etapa), a.etapasEnTexto],
  recurso: (a) => [a.recurso],
  titulo: (a) => [a.titulo],
  saberes: (a, etapa) => a.saberesDe(etapa),
  etapa: (a) => a.nombresEtapas,
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
   * Con etapa, solo las actividades que sirven para esa etapa.
   */
  buscar(texto, campo = 'todo', etapa = null) {
    const camposDe = CAMPOS_BUSQUEDA[campo] ?? CAMPOS_BUSQUEDA.todo;
    const palabras = String(texto ?? '').split(/\s+/).filter(Boolean);
    return this.actividades.filter((actividad) =>
      (!etapa || actividad.tieneEtapa(etapa))
      && palabras.every((palabra) => coincide(palabra, camposDe(actividad, etapa))),
    );
  }

  /** Los distintos recursos que hay, en orden alfabético. */
  recursos() {
    return [...new Set(this.actividades.map((a) => a.recurso).filter(Boolean))].sort();
  }
}
