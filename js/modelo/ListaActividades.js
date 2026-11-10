/*
 * ListaActividades
 * ----------------
 * Todas las actividades, cargadas de una sola vez, con búsqueda.
 *
 *   const lista = await ListaActividades.cargar(baseDatos);
 *   lista.buscar('huellas', 'recurso');                // solo en la columna Recurso
 *   lista.buscar('medida', 'saberes', 'Infantil');     // saberes de Infantil
 *   lista.buscar('compost');                           // en todas las columnas
 *   lista.buscar('', 'todo', null, 'Invierno');        // las que se pueden hacer en invierno
 */

import { Actividad } from './Actividad.js';
import { coincide } from './texto.js';

// Qué textos de una actividad mira cada opción de "Buscar en".
// Si se ha elegido una etapa, los saberes son solo los de esa etapa.
export const CAMPOS_BUSQUEDA = {
  todo: (a, etapa) => [a.recurso, a.titulo, a.nombreCategoria, ...a.saberesDe(etapa), a.etapasEnTexto, a.estacionesEnTexto],
  recurso: (a) => [a.recurso],
  titulo: (a) => [a.titulo, a.nombreCategoria],
  saberes: (a, etapa) => a.saberesDe(etapa),
  etapa: (a) => a.nombresEtapas,
  epoca: (a) => [a.estacionesEnTexto, a.epoca],
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
   * Con etapa, solo las actividades que sirven para esa etapa; con
   * estación, solo las que se pueden hacer en ella; con categoría (id),
   * solo las de esa categoría.
   */
  buscar(texto, campo = 'todo', etapa = null, estacion = null, categoria = null) {
    const camposDe = CAMPOS_BUSQUEDA[campo] ?? CAMPOS_BUSQUEDA.todo;
    const palabras = String(texto ?? '').split(/\s+/).filter(Boolean);
    return this.actividades.filter((actividad) =>
      (!etapa || actividad.tieneEtapa(etapa))
      && (!estacion || actividad.esDeEstacion(estacion))
      && (!categoria || actividad.categoria === categoria)
      && palabras.every((palabra) => coincide(palabra, camposDe(actividad, etapa))),
    );
  }

  /**
   * Los saberes de una actividad (de la etapa, si se indica) que contienen
   * alguna de las palabras buscadas, cada uno con las etapas en que aparece:
   *   [{ saber: 'Matemáticas (B.1): …', etapas: ['Primaria · 1.er ciclo'] }, …]
   * Sirve para enseñar en la tabla solo los saberes que explican por qué
   * ha salido la actividad. Si un saber está en varias etapas, sale una vez.
   */
  static saberesQueCoinciden(actividad, texto, etapa = null) {
    const palabras = String(texto ?? '').split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return [];
    const etapasDeCadaSaber = new Map(); // saber → [etapas]
    for (const { etapa: nombre, saberes } of actividad.etapas) {
      if (etapa && nombre !== etapa) continue;
      for (const saber of saberes) {
        if (palabras.some((palabra) => coincide(palabra, [saber]))) {
          etapasDeCadaSaber.set(saber, [...(etapasDeCadaSaber.get(saber) ?? []), nombre]);
        }
      }
    }
    return [...etapasDeCadaSaber].map(([saber, etapas]) => ({ saber, etapas }));
  }

  /** Los distintos recursos que hay, en orden alfabético. */
  recursos() {
    return [...new Set(this.actividades.map((a) => a.recurso).filter(Boolean))].sort();
  }
}
