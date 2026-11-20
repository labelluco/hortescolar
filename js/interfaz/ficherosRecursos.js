/*
 * ficherosRecursos.js
 * -------------------
 * Pasar los ficheros de recursos (ver modelo/recursos.js) del ordenador a la
 * base de datos y de la base de datos al ordenador.
 *
 *   prepararRecurso(fichero)  lo comprueba y lo convierte en texto
 *                             "data:…;base64,…" para guardarlo
 *   abrirRecurso(…)           lo abre en otra pestaña (PDF e imágenes) o lo
 *                             descarga con su nombre
 */

import { TAMANO_MAXIMO_RECURSO, sePuedeVer, tamanoEnTexto, tipoRecurso } from '../modelo/recursos.js';
import { reducirImagen } from './reducirImagen.js';

// Las infografías se reducen menos que las fotos, para que se lean bien
const LADO_MAXIMO_INFOGRAFIA = 2400;

/**
 * Devuelve { nombre, tamano, datos } o lanza un error con un texto para
 * enseñar. Las imágenes que pasan del máximo se reducen (y pasan a JPEG);
 * el resto de ficheros que pasan del máximo no se admiten.
 */
export async function prepararRecurso(fichero) {
  const tipo = tipoRecurso(fichero.name);
  if (!tipo) {
    throw new Error(`«${fichero.name}»: ese tipo de fichero no se admite. Sirven PDF, imágenes y documentos de oficina.`);
  }
  if (fichero.size <= TAMANO_MAXIMO_RECURSO) {
    return { nombre: fichero.name, tamano: fichero.size, datos: await leerComoTexto(fichero, tipo) };
  }
  if (tipo.startsWith('image/')) {
    const datos = await reducirImagen(fichero, LADO_MAXIMO_INFOGRAFIA);
    const nombre = fichero.name.replace(/\.[^.]+$/, '') + '.jpg';
    return { nombre, tamano: bytesDeDatos(datos), datos };
  }
  throw new Error(`«${fichero.name}» ocupa ${tamanoEnTexto(fichero.size)} y el máximo es ${tamanoEnTexto(TAMANO_MAXIMO_RECURSO)}. `
    + 'Prueba a exportarlo otra vez con menos calidad de imagen o a comprimirlo.');
}

/** El fichero como "data:{tipo};base64,…", con el tipo de su extensión. */
function leerComoTexto(fichero, tipo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error(`No se ha podido leer «${fichero.name}».`));
    lector.readAsDataURL(new Blob([fichero], { type: tipo }));
  });
}

/** Bytes que ocupa el fichero de un texto "data:…;base64,…". */
function bytesDeDatos(datos) {
  const base64 = datos.slice(datos.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4) - (base64.match(/=+$/)?.[0].length ?? 0);
}

/**
 * Abre o descarga un recurso. Recibe una función que devuelve su dirección
 * (puede tardar: hay que leerlo de la base de datos).
 *
 * La pestaña nueva se abre antes de esperar, porque el navegador solo deja
 * abrirla justo al hacer clic. El tipo se pone según la extensión (nunca el
 * guardado), y lo que no es PDF ni imagen siempre se descarga.
 */
export async function abrirRecurso(leerDireccion, nombre, descargar = false) {
  const ver = !descargar && sePuedeVer(nombre);
  const pestana = ver ? window.open('', '_blank') : null;
  try {
    const direccion = await leerDireccion();
    if (!direccion) {
      throw new Error('No se ha encontrado el fichero.');
    }
    const contenido = await (await fetch(direccion)).blob();
    const tipo = ver ? tipoRecurso(nombre) : 'application/octet-stream';
    const enlace = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    if (pestana) {
      pestana.location.href = enlace;
    } else {
      const descarga = document.createElement('a');
      descarga.href = enlace;
      descarga.download = nombre;
      descarga.click();
    }
    setTimeout(() => URL.revokeObjectURL(enlace), 60_000);
  } catch (error) {
    pestana?.close();
    throw error;
  }
}
