/*
 * actividad.js
 * ------------
 * Ficha de una actividad (actividad.html?id=…): recurso, etapa, saberes,
 * descripción, objetivos, materiales, desarrollo e imágenes (con ampliación
 * al hacer clic).
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad } from '../modelo/Actividad.js';
import { escaparHtml, listaHtml } from './ayudas.js';

const ficha = document.getElementById('ficha');
const baseDatos = BaseDatos.preparar();

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

  const imagenes = actividad.imagenes.map((imagen, posicion) => `
    <button type="button" class="miniatura" data-posicion="${posicion}">
      <img src="${escaparHtml(baseDatos.direccionImagen(imagen.ruta))}" alt="${escaparHtml(imagen.texto)}" loading="lazy">
    </button>`).join('');

  ficha.innerHTML = `
    <h1>${escaparHtml(actividad.titulo)}</h1>
    <dl class="datos tarjeta">
      <div><dt>Recurso</dt><dd>${escaparHtml(actividad.recurso)}</dd></div>
      <div><dt>Etapa</dt><dd>${escaparHtml(actividad.etapa)}</dd></div>
      ${actividad.duracion ? `<div><dt>Duración</dt><dd>${escaparHtml(actividad.duracion)}</dd></div>` : ''}
      ${actividad.epoca ? `<div><dt>Época</dt><dd>${escaparHtml(actividad.epoca)}</dd></div>` : ''}
      <div class="datos-ancho"><dt>Saberes básicos</dt><dd>${actividad.saberes.map((s) => `<span class="etiqueta">${escaparHtml(s)}</span>`).join(' ')}</dd></div>
    </dl>
    ${seccion('Descripción', actividad.descripcion && `<p>${escaparHtml(actividad.descripcion)}</p>`)}
    ${seccion('Objetivos', actividad.objetivos.length && listaHtml(actividad.objetivos))}
    ${seccion('Materiales', actividad.materiales.length && listaHtml(actividad.materiales))}
    ${seccion('Desarrollo', actividad.desarrollo.length && listaHtml(actividad.desarrollo, 'ol'))}
    ${seccion('Imágenes', imagenes && `<div class="galeria">${imagenes}</div>`)}
  `;

  ficha.querySelectorAll('.miniatura').forEach((boton) => {
    boton.addEventListener('click', () => ampliar(actividad.imagenes[boton.dataset.posicion]));
  });
}

function ampliar(imagen) {
  document.getElementById('ampliacionImagen').src = baseDatos.direccionImagen(imagen.ruta);
  document.getElementById('ampliacionImagen').alt = imagen.texto ?? '';
  document.getElementById('ampliacionTexto').textContent = imagen.texto ?? '';
  document.getElementById('ampliacion').showModal();
}

const id = new URLSearchParams(location.search).get('id');
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
