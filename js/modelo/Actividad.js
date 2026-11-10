/*
 * Actividad
 * ---------
 * Una actividad del huerto escolar. Las cuatro primeras propiedades son las
 * columnas de la tabla de la portada; el resto se ve en la ficha.
 *
 *   id          identificador ("act-001")
 *   recurso     lo que hay en el huerto y da pie a la actividad ("Huellas de animales")
 *   titulo      nombre de la actividad ("Detectives de huellas")
 *   saberes     saberes básicos que se trabajan (lista de textos)
 *   etapa       etapa o ciclo ("Infantil", "Primaria · 1.er ciclo"…)
 *   descripcion resumen de la actividad
 *   objetivos   lista de textos
 *   materiales  lista de textos
 *   desarrollo  pasos de la actividad, en orden (lista de textos)
 *   duracion    texto libre ("1 sesión de 50 min")
 *   epoca       época del año más adecuada (texto libre)
 *   imagenes    hasta 10: { ruta, texto }
 */

export class Actividad {
  constructor(datos) {
    this.id = datos.id;
    this.recurso = datos.recurso ?? '';
    this.titulo = datos.titulo ?? '';
    this.saberes = datos.saberes ?? [];
    this.etapa = datos.etapa ?? '';
    this.descripcion = datos.descripcion ?? '';
    this.objetivos = datos.objetivos ?? [];
    this.materiales = datos.materiales ?? [];
    this.desarrollo = datos.desarrollo ?? [];
    this.duracion = datos.duracion ?? '';
    this.epoca = datos.epoca ?? '';
    this.imagenes = datos.imagenes ?? [];
  }

  static desdeDocumento(documento) {
    return new Actividad(documento);
  }

  /** Lee una actividad por su id; null si no existe. */
  static async leer(id, baseDatos) {
    const documento = await baseDatos.leerDocumento('actividades', id);
    return documento ? Actividad.desdeDocumento(documento) : null;
  }

  /** Los saberes en un solo texto, para buscar y ordenar. */
  get saberesEnTexto() {
    return this.saberes.join(' · ');
  }
}
