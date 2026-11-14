/*
 * actividad.js
 * ------------
 * Ficha de una actividad (actividad.html?id=…): recurso, etapa, saberes,
 * descripción, objetivos, materiales, desarrollo e imágenes (con ampliación
 * al hacer clic).
 *
 * Con sesión, además: quién la creó, modificó y revisó, el botón «Editar»
 * (si se tiene permiso, ver modelo/permisos.js) y, si está pendiente de
 * revisión, un aviso y, para los revisores, el botón «Aprobar y publicar».
 * Sin sesión, las pendientes no se pueden ver.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad, PUBLICADA } from '../modelo/Actividad.js';
import { puedeAprobar, puedeEditar } from '../modelo/permisos.js';
import { Barra } from './Barra.js';
import { estacionesHtml } from './estacionesHtml.js';
import { categoriaHtml } from './categoriaHtml.js';
import { escaparHtml, listaHtml, textoConEnlaces } from './ayudas.js';

const ficha = document.getElementById('ficha');
const baseDatos = BaseDatos.preparar();
const id = new URLSearchParams(location.search).get('id');

const usuario = await Barra.pintar();

// Si venimos de la tabla, "Volver" regresa a ella con la búsqueda que había.
const anterior = document.referrer ? new URL(document.referrer) : null;
if (anterior && anterior.origin === location.origin && /\/actividades\.html$/.test(anterior.pathname)) {
  document.getElementById('volver').href = document.referrer;
}

function seccion(titulo, contenido) {
  return contenido ? `<section class="tarjeta seccion"><h2>${titulo}</h2>${contenido}</section>` : '';
}

function pintar(actividad) {
  document.title = `${actividad.titulo} · Huerto escolar`;

  // Las imágenes se cargan después, cada una cuando llega (ver pintarImagenes)
  const imagenes = actividad.imagenes.map((imagen, posicion) => `
    <button type="button" class="miniatura" data-posicion="${posicion}" aria-label="Ampliar imagen ${posicion + 1}">
      <img alt="${escaparHtml(imagen.texto)}">
    </button>`).join('');

  if (puedeEditar(usuario, actividad)) {
    const botonEditar = document.getElementById('botonEditar');
    botonEditar.href = `editar.html?id=${encodeURIComponent(actividad.id)}`;
    botonEditar.hidden = false;
  }

  ficha.innerHTML = `
    ${actividad.estaPublicada ? '' : htmlPendiente(actividad)}
    <h1>${escaparHtml(actividad.titulo)}</h1>
    <p class="ficha-categoria">${categoriaHtml(actividad.categoria)}</p>
    <dl class="datos tarjeta">
      <div><dt>Recurso</dt><dd>${escaparHtml(actividad.recurso)}</dd></div>
      <div><dt>Etapas</dt><dd>${actividad.nombresEtapas.map((e) => `<span class="etiqueta">${escaparHtml(e)}</span>`).join(' ')}</dd></div>
      ${actividad.duracion ? `<div><dt>Duración</dt><dd>${escaparHtml(actividad.duracion)}</dd></div>` : ''}
      ${actividad.estaciones.length || actividad.epoca ? `<div class="datos-ancho"><dt>Época</dt><dd>
        ${actividad.estaciones.length ? `${estacionesHtml(actividad.estaciones)} <span class="estaciones-texto">${escaparHtml(actividad.estacionesEnTexto)}</span>` : ''}
        ${actividad.epoca ? `<div class="nota-epoca">${escaparHtml(actividad.epoca)}</div>` : ''}
      </dd></div>` : ''}
    </dl>
    ${seccion('Descripción', actividad.descripcion && `<p>${textoConEnlaces(actividad.descripcion)}</p>`)}
    ${seccion('Objetivos', actividad.objetivos.length && listaHtml(actividad.objetivos))}
    ${seccion('Materiales', actividad.materiales.length && listaHtml(actividad.materiales))}
    ${seccion('Desarrollo', actividad.desarrollo.length && listaHtml(actividad.desarrollo, 'ol'))}
    ${seccion('Por etapas: adaptaciones y saberes básicos', htmlEtapas(actividad))}
    ${seccion('Notas y precauciones', actividad.notas.length && listaHtml(actividad.notas))}
    ${seccion('Imágenes', imagenes && `<div class="galeria">${imagenes}</div>`)}
    ${usuario ? htmlAutoria(actividad) : ''}
    ${htmlCita(actividad)}
  `;

  document.getElementById('botonAprobar')?.addEventListener('click', () => aprobar(actividad));
  pintarImagenes(actividad);
}

/**
 * Cómo usar y citar la actividad (licencia CC BY-SA 4.0, ver LICENCIA-CONTENIDOS.md).
 * Quien la reutilice debe citar el origen y compartir su versión con la misma licencia.
 */
function htmlCita(actividad) {
  return `
    <p class="cita">
      Puedes usar, copiar y adaptar esta actividad. Si la compartes, cita su origen
      («${escaparHtml(actividad.titulo)}», Huerto escolar de <a href="https://labelluco.github.io/abelluco/">L'Abelluco</a>,
      ${escaparHtml(location.href)}) y comparte tu versión con la misma licencia,
      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" rel="license">CC BY-SA 4.0</a>.
    </p>`;
}

/** Aviso de actividad pendiente, con el botón de aprobar para los revisores. */
function htmlPendiente(actividad) {
  return `
    <div class="aviso aviso-revision" role="status">
      <p><strong>Pendiente de revisión.</strong> Solo la ve el profesorado con sesión hasta que una persona revisora la apruebe.</p>
      ${puedeAprobar(usuario, actividad) ? '<button type="button" class="boton boton-principal" id="botonAprobar">Aprobar y publicar</button>' : ''}
      <p class="error" id="errorAprobar" role="alert"></p>
    </div>`;
}

/** Quién creó, modificó y revisó la actividad (solo para el profesorado). */
function htmlAutoria(actividad) {
  const fecha = (iso) => new Date(iso).toLocaleDateString('es-ES');
  const linea = (texto, dato) => (dato ? `<li>${texto} <strong>${escaparHtml(dato.por)}</strong> el ${fecha(dato.el)}</li>` : '');
  const lineas = linea('Creada por', actividad.creada)
    + linea('Última modificación por', actividad.modificada)
    + linea('Revisada por', actividad.revisada);
  return lineas ? `<section class="autoria"><ul>${lineas}</ul><p>Solo lo ve el profesorado con sesión.</p></section>` : '';
}

/** Un revisor aprueba una actividad pendiente: pasa a publicada. */
async function aprobar(actividad) {
  const boton = document.getElementById('botonAprobar');
  boton.disabled = true;
  try {
    actividad.estado = PUBLICADA;
    actividad.revisada = { por: usuario.correo, el: new Date().toISOString() };
    await baseDatos.aplicarCambios([
      { tipo: 'guardar', coleccion: 'actividades', id: actividad.id, datos: actividad.aDocumento() },
    ]);
    pintar(actividad);
  } catch (error) {
    console.error(error);
    document.getElementById('errorAprobar').textContent = 'No se ha podido aprobar. Vuelve a probar.';
    boton.disabled = false;
  }
}

/**
 * Un desplegable por etapa con su adaptación y sus saberes básicos. Se abre
 * la etapa elegida en la tabla (?etapa=…), o la única si solo hay una.
 */
function htmlEtapas(actividad) {
  const elegida = new URLSearchParams(location.search).get('etapa');
  return actividad.etapas.map(({ etapa, saberes, adaptacion }) => {
    const abierta = etapa === elegida || actividad.etapas.length === 1;
    return `
      <details class="etapa" ${abierta ? 'open' : ''}>
        <summary>${escaparHtml(etapa)}</summary>
        ${adaptacion ? `<p><strong>Adaptación:</strong> ${escaparHtml(adaptacion)}</p>` : ''}
        ${saberes.length ? `<p><strong>Saberes básicos</strong> (currículo de Aragón):</p>${listaHtml(saberes)}` : ''}
      </details>`;
  }).join('');
}

function pintarImagenes(actividad) {
  ficha.querySelectorAll('.miniatura').forEach(async (boton) => {
    const imagen = actividad.imagenes[boton.dataset.posicion];
    const direccion = await baseDatos.direccionImagen(imagen);
    boton.querySelector('img').src = direccion;
    boton.addEventListener('click', () => ampliar(direccion, imagen.texto));
  });
}

function ampliar(direccion, texto) {
  document.getElementById('ampliacionImagen').src = direccion;
  document.getElementById('ampliacionImagen').alt = texto ?? '';
  document.getElementById('ampliacionTexto').textContent = texto ?? '';
  document.getElementById('ampliacion').showModal();
}

try {
  const actividad = id ? await Actividad.leer(id, baseDatos) : null;
  // Sin sesión, una pendiente es como si no existiera (Firestore tampoco la deja leer)
  if (actividad && (actividad.estaPublicada || usuario)) {
    pintar(actividad);
  } else {
    ficha.innerHTML = '<p class="resultado">No existe esa actividad.</p>';
  }
} catch (error) {
  console.error(error);
  ficha.innerHTML = '<p class="resultado">No se ha podido cargar la actividad.</p>';
}
