/*
 * actividad.js
 * ------------
 * Ficha de una actividad (actividad.html?id=…): recurso, etapa, saberes,
 * descripción, objetivos, materiales, desarrollo e imágenes (con ampliación
 * al hacer clic). Con sesión iniciada aparece el botón «Editar».
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad } from '../modelo/Actividad.js';
import { Barra } from './Barra.js';
import { estacionesHtml } from './estacionesHtml.js';
import { categoriaHtml } from './categoriaHtml.js';
import { escaparHtml, listaHtml } from './ayudas.js';

const ficha = document.getElementById('ficha');
const baseDatos = BaseDatos.preparar();
const id = new URLSearchParams(location.search).get('id');

Barra.pintar().then((usuario) => {
  if (usuario && id) {
    const botonEditar = document.getElementById('botonEditar');
    botonEditar.href = `editar.html?id=${encodeURIComponent(id)}`;
    botonEditar.hidden = false;
  }
});

// Si venimos de la tabla, "Volver" regresa a ella con la búsqueda que había.
const anterior = document.referrer ? new URL(document.referrer) : null;
if (anterior && anterior.origin === location.origin && /\/(index\.html)?$/.test(anterior.pathname)) {
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

  ficha.innerHTML = `
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
    ${seccion('Descripción', actividad.descripcion && `<p>${escaparHtml(actividad.descripcion)}</p>`)}
    ${seccion('Objetivos', actividad.objetivos.length && listaHtml(actividad.objetivos))}
    ${seccion('Materiales', actividad.materiales.length && listaHtml(actividad.materiales))}
    ${seccion('Desarrollo', actividad.desarrollo.length && listaHtml(actividad.desarrollo, 'ol'))}
    ${seccion('Por etapas: adaptaciones y saberes básicos', htmlEtapas(actividad))}
    ${seccion('Notas y precauciones', actividad.notas.length && listaHtml(actividad.notas))}
    ${seccion('Imágenes', imagenes && `<div class="galeria">${imagenes}</div>`)}
  `;

  pintarImagenes(actividad);
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
  if (actividad) {
    pintar(actividad);
  } else {
    ficha.innerHTML = '<p class="resultado">No existe esa actividad.</p>';
  }
} catch (error) {
  console.error(error);
  ficha.innerHTML = '<p class="resultado">No se ha podido cargar la actividad.</p>';
}
