/*
 * Actividad
 * ---------
 * Una actividad del huerto escolar. Las cuatro primeras propiedades son las
 * columnas de la tabla de la portada; el resto se ve en la ficha.
 *
 *   id          identificador
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
 *   imagenes    hasta 10, en orden: { id, texto } (colección 'imagenes')
 *               o { ruta, texto } (fichero en datos/, solo los ejemplos)
 *   modificada  { por: correo, el: fecha ISO } del último cambio
 */

export const MAXIMO_IMAGENES = 10;

export class Actividad {
  constructor(datos = {}) {
    this.id = datos.id ?? null;
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
    this.modificada = datos.modificada ?? null;
  }

  static desdeDocumento(documento) {
    return new Actividad(documento);
  }

  /** Lee una actividad por su id; null si no existe. */
  static async leer(id, baseDatos) {
    const documento = await baseDatos.leerDocumento('actividades', id);
    return documento ? Actividad.desdeDocumento(documento) : null;
  }

  /** Los datos que se guardan en la base de datos (todo menos el id). */
  aDocumento() {
    return {
      recurso: this.recurso,
      titulo: this.titulo,
      saberes: this.saberes,
      etapa: this.etapa,
      descripcion: this.descripcion,
      objetivos: this.objetivos,
      materiales: this.materiales,
      desarrollo: this.desarrollo,
      duracion: this.duracion,
      epoca: this.epoca,
      imagenes: this.imagenes,
      modificada: this.modificada,
    };
  }

  /** Lista de textos que faltan para poder guardarla (vacía si está bien). */
  errores() {
    const errores = [];
    if (!this.titulo) errores.push('Falta el nombre de la actividad.');
    if (!this.recurso) errores.push('Falta el recurso.');
    if (!this.etapa) errores.push('Falta la etapa.');
    if (this.imagenes.length > MAXIMO_IMAGENES) errores.push(`Como mucho, ${MAXIMO_IMAGENES} imágenes.`);
    return errores;
  }

  /** Los saberes en un solo texto, para buscar y ordenar. */
  get saberesEnTexto() {
    return this.saberes.join(' · ');
  }
}
