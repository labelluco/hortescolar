/*
 * reducirImagen.js
 * ----------------
 * Reduce una foto elegida en el formulario (por ejemplo, una del móvil de
 * 4000 px y 5 MB) a una imagen JPEG de como mucho 1280 px de lado, y la
 * devuelve como texto "data:image/jpeg;base64,…" para guardarla en la base
 * de datos.
 *
 * Firestore no admite documentos de más de 1 MB, así que si aún ocupa
 * demasiado, se baja la calidad y, si hace falta, el tamaño.
 */

const LADO_MAXIMO = 1280;
const CARACTERES_MAXIMOS = 900_000; // margen por debajo de 1 MB

export async function reducirImagen(fichero) {
  const imagen = await createImageBitmap(fichero);
  let lado = LADO_MAXIMO;
  let calidad = 0.82;

  for (let intento = 0; intento < 8; intento++) {
    const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

    const datos = lienzo.toDataURL('image/jpeg', calidad);
    if (datos.length <= CARACTERES_MAXIMOS) {
      return datos;
    }
    if (calidad > 0.6) {
      calidad -= 0.1;
    } else {
      lado = Math.round(lado * 0.8);
    }
  }
  throw new Error(`No se ha podido reducir la imagen «${fichero.name}».`);
}
