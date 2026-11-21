/*
 * recursos.js
 * -----------
 * Recursos de una actividad: ficheros para descargar o ver (infografías,
 * fichas, plantillas…), como mucho MAXIMO_RECURSOS por actividad.
 *
 * En la actividad, cada recurso es { id, nombre, tamano, texto, partes }:
 *   id      documento de la colección 'recursos' con el fichero
 *           (o { ruta }: fichero dentro de datos/, solo los ejemplos)
 *   nombre  nombre del fichero ("ficha-huellas.pdf")
 *   tamano  en bytes
 *   texto   descripción opcional (qué es, autoría y licencia si no es propio)
 *   partes  en cuántos documentos está (1 si no se indica)
 *
 * Como las imágenes, el fichero se guarda en Firestore como texto
 * "data:…;base64,…" (sin Firebase Storage, para seguir en el plan gratuito).
 * Un documento no puede pasar de 1 MB, así que los ficheros grandes se
 * parten en trozos de CARACTERES_POR_PARTE: el primero va en el documento
 * {id}, el segundo en {id}-1, el tercero en {id}-2…
 *
 * Tamaño máximo de cada fichero: TAMANO_MAXIMO_RECURSO para el profesorado
 * (cabe en un solo documento) y TAMANO_MAXIMO_REVISOR para los revisores
 * (Firestore no deja guardar más de 10 MB de una vez, y el base64 ocupa un
 * tercio más).
 *
 * Solo se admiten los tipos de TIPOS_RECURSO, y el tipo se deduce siempre
 * de la extensión: así nunca se abre en la web un fichero que pueda llevar
 * código (una página HTML o un SVG).
 */

export const MAXIMO_RECURSOS = 5;
export const TAMANO_MAXIMO_RECURSO = 700 * 1024;
export const TAMANO_MAXIMO_REVISOR = 6 * 1024 * 1024;
export const CARACTERES_POR_PARTE = 900_000;

/** Tamaño máximo de cada recurso para ese usuario ({ revisor }). */
export function tamanoMaximoRecurso(usuario) {
  return usuario?.revisor ? TAMANO_MAXIMO_REVISOR : TAMANO_MAXIMO_RECURSO;
}

/** Ids de los documentos donde está el fichero de un recurso, en orden. */
export function idsDePartes(recurso) {
  return Array.from({ length: recurso.partes ?? 1 }, (_, i) => (i === 0 ? recurso.id : `${recurso.id}-${i}`));
}

/** Parte el texto "data:…" de un fichero en trozos que caben en un documento. */
export function partirDatos(datos) {
  const partes = [];
  for (let desde = 0; desde < datos.length; desde += CARACTERES_POR_PARTE) {
    partes.push(datos.slice(desde, desde + CARACTERES_POR_PARTE));
  }
  return partes;
}

/** Extensiones admitidas y su tipo. */
export const TIPOS_RECURSO = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** Extensión en minúsculas ("pdf"), o '' si no tiene. */
export function extension(nombre) {
  const partes = String(nombre).toLowerCase().split('.');
  return partes.length > 1 ? partes.pop() : '';
}

/** Tipo del fichero según su extensión, o null si no se admite. */
export function tipoRecurso(nombre) {
  return TIPOS_RECURSO[extension(nombre)] ?? null;
}

/** ¿Se puede abrir en el navegador (PDF e imágenes) o solo descargar? */
export function sePuedeVer(nombre) {
  const tipo = tipoRecurso(nombre);
  return tipo === 'application/pdf' || Boolean(tipo?.startsWith('image/'));
}

/** "340 KB", "1,2 MB" */
export function tamanoEnTexto(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;
}

/** Texto para el atributo accept del selector de ficheros (".pdf,.png,…"). */
export const EXTENSIONES_ADMITIDAS = Object.keys(TIPOS_RECURSO).map((e) => `.${e}`).join(',');
