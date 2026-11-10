/*
 * importar.js
 * -----------
 * Página para subir de una vez actividades preparadas en ficheros JSON
 * (importar.html). Solo para el profesorado con sesión.
 *
 * Cada fichero es un array de actividades con el mismo formato que la
 * colección 'actividades' más su "id". Antes de subir se enseña qué se va a
 * hacer con cada una (nueva o sustituye) y si le falta algo. Si una
 * actividad ya existe y tiene imágenes, se conservan.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad } from '../modelo/Actividad.js';
import { Sesion } from './Sesion.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';

const usuario = await Sesion.proteger();
Barra.pintar();

const baseDatos = BaseDatos.preparar();
const vistaPrevia = document.getElementById('vistaPrevia');
const textoError = document.getElementById('error');
const botonSubir = document.getElementById('botonSubir');

let preparadas = []; // actividades listas para subir

async function leerFicheros(ficheros) {
  const actividades = [];
  for (const fichero of ficheros) {
    let contenido;
    try {
      contenido = JSON.parse(await fichero.text());
    } catch {
      throw new Error(`«${fichero.name}» no es un JSON válido.`);
    }
    const documentos = Array.isArray(contenido) ? contenido : [contenido];
    actividades.push(...documentos.map(Actividad.desdeDocumento));
  }
  return actividades;
}

document.getElementById('ficheros').addEventListener('change', async (evento) => {
  textoError.textContent = '';
  botonSubir.hidden = true;
  vistaPrevia.innerHTML = '';
  try {
    const actividades = await leerFicheros([...evento.target.files]);
    const existentes = new Map(
      (await baseDatos.leerColeccion('actividades')).map((documento) => [documento.id, documento]),
    );

    const filas = actividades.map((actividad) => {
      const errores = actividad.id ? actividad.errores() : ['Falta el id.'];
      const existente = existentes.get(actividad.id);
      if (existente && actividad.imagenes.length === 0) {
        actividad.imagenes = existente.imagenes ?? []; // se conservan sus imágenes
      }
      return { actividad, errores, existe: Boolean(existente) };
    });
    preparadas = filas.filter((fila) => fila.errores.length === 0).map((fila) => fila.actividad);

    vistaPrevia.innerHTML = `
      <table class="tabla">
        <thead><tr><th>Actividad</th><th>Categoría</th><th>Etapas</th><th>Qué se hará</th></tr></thead>
        <tbody>${filas.map(({ actividad, errores, existe }) => `
          <tr>
            <td>${escaparHtml(actividad.titulo || actividad.id || '(sin nombre)')}</td>
            <td>${escaparHtml(actividad.nombreCategoria)}</td>
            <td>${escaparHtml(actividad.etapasEnTexto)}</td>
            <td>${errores.length
              ? `<span class="error">No se subirá: ${escaparHtml(errores.join(' '))}</span>`
              : (existe ? 'Sustituye la que ya existe' : 'Nueva')}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
    botonSubir.textContent = preparadas.length === 1 ? 'Subir 1 actividad' : `Subir ${preparadas.length} actividades`;
    botonSubir.hidden = preparadas.length === 0;
  } catch (error) {
    console.error(error);
    textoError.textContent = error.message;
  }
});

botonSubir.addEventListener('click', async () => {
  botonSubir.disabled = true;
  textoError.textContent = 'Subiendo…';
  const ahora = new Date().toISOString();
  try {
    await baseDatos.aplicarCambios(preparadas.map((actividad) => {
      actividad.modificada = { por: usuario.correo, el: ahora };
      return { tipo: 'guardar', coleccion: 'actividades', id: actividad.id, datos: actividad.aDocumento() };
    }));
    location.href = 'index.html';
  } catch (error) {
    console.error(error);
    textoError.textContent = 'No se ha podido subir. Comprueba la conexión y vuelve a probar.';
    botonSubir.disabled = false;
  }
});
