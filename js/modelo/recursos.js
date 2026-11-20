/*
 * recursos.js
 * -----------
 * Recursos de una actividad: ficheros para descargar o ver (infografías,
 * fichas, plantillas…), como mucho MAXIMO_RECURSOS por actividad.
 *
 * En la actividad, cada recurso es { id, nombre, tamano, texto }:
 *   id      documento de la colección 'recursos' con el fichero
 *           (o { ruta }: fichero dentro de datos/, solo los ejemplos)
 *   nombre  nombre del fichero ("ficha-huellas.pdf")
 *   tamano  en bytes
 *   texto   descripción opcional (qué es, autoría y licencia si no es propio)
 *
 * Como las imágenes, el fichero se guarda en Firestore como texto
 * "data:…;base64,…" (sin Firebase Storage, para seguir en el plan gratuito).
 * Un documento no puede pasar de 1 MB y el base64 ocupa un tercio más, así
 * que cada fichero puede ocupar como mucho TAMANO_MAXIMO_RECURSO.
 *
 * Solo se admiten los tipos de TIPOS_RECURSO, y el tipo se deduce siempre
 * de la extensión: así nunca se abre en la web un fichero que pueda llevar
 * código (una página HTML o un SVG).
 */

export const MAXIMO_RECURSOS = 5;
export const TAMANO_MAXIMO_RECURSO = 700 * 1024;

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
