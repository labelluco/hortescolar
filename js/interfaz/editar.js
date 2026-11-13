/*
 * editar.js
 * ---------
 * Formulario para crear (editar.html) o modificar (editar.html?id=…) una
 * actividad, con sus imágenes. Solo para el profesorado con sesión.
 *
 * Las imágenes nuevas se reducen en el propio navegador (reducirImagen.js)
 * y se guardan en la colección 'imagenes', una por documento. Al guardar,
 * la actividad, las imágenes nuevas y las quitadas se escriben de una vez:
 * o se guarda todo o nada.
 *
 * Revisión (ver modelo/permisos.js): lo que guarda un revisor queda
 * publicado; lo que guarda un usuario normal queda pendiente de revisión.
 * Un usuario normal solo puede abrir aquí sus propias actividades pendientes.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad, ETAPAS, MAXIMO_IMAGENES } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { ESTACIONES } from '../modelo/estaciones.js';
import { CATEGORIAS } from '../modelo/categorias.js';
import { estadoAlGuardar, puedeEditar } from '../modelo/permisos.js';
import { Sesion } from './Sesion.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';
import { reducirImagen } from './reducirImagen.js';

const usuario = await Sesion.proteger();
Barra.pintar();

const baseDatos = BaseDatos.preparar();
const formulario = document.getElementById('formulario');
const textoError = document.getElementById('error');
const contenedorImagenes = document.getElementById('imagenes');

// Campos de texto que en la actividad son listas (una línea = un elemento)
const CAMPOS_LISTA = ['objetivos', 'materiales', 'desarrollo', 'notas'];
const CAMPOS_TEXTO = ['titulo', 'categoria', 'recurso', 'descripcion', 'duracion', 'epoca'];
const contenedorEtapas = document.getElementById('etapas');

// Opciones de la categoría (la primera, vacía, obliga a elegir una)
document.getElementById('categoria').innerHTML = '<option value="">Elige una categoría…</option>'
  + CATEGORIAS.map((c) => `<option value="${c.id}">${escaparHtml(c.nombre)}</option>`).join('');

let actividad = new Actividad();
// Imágenes tal como se ven en el formulario, en orden:
//   { id | ruta, texto, src, datos? }   (datos solo en las nuevas)
let imagenes = [];
const idsImagenesQuitadas = [];
let hayCambios = false;

/* ---------- Cargar ---------- */

async function cargar() {
  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    actividad = await Actividad.leer(id, baseDatos);
    if (!actividad) {
      document.getElementById('tituloPagina').textContent = 'No existe esa actividad.';
      return;
    }
    if (!puedeEditar(usuario, actividad)) {
      document.getElementById('tituloPagina').textContent = actividad.estaPublicada
        ? 'Las actividades publicadas solo las pueden editar las personas revisoras.'
        : 'Solo puedes editar tus propias actividades pendientes de revisión.';
      return;
    }
    document.getElementById('tituloPagina').textContent = 'Editar actividad';
    document.getElementById('botonBorrar').hidden = false;
    const ficha = `actividad.html?id=${encodeURIComponent(id)}`;
    document.getElementById('volver').href = ficha;
    document.getElementById('botonCancelar').href = ficha;
    rellenarFormulario();
    imagenes = await Promise.all(actividad.imagenes.map(async (imagen) => ({
      ...imagen,
      src: await baseDatos.direccionImagen(imagen),
    })));
  }
  pintarEtapas();
  pintarEstaciones();
  await rellenarSugerencias();
  pintarImagenes();
  document.getElementById('avisoRevision').hidden = usuario.revisor;
  formulario.hidden = false;
}

function rellenarFormulario() {
  for (const campo of CAMPOS_TEXTO) {
    formulario.elements[campo].value = actividad[campo];
  }
  for (const campo of CAMPOS_LISTA) {
    formulario.elements[campo].value = actividad[campo].join('\n');
  }
}

/** Los recursos que ya existen, para que se escriban igual. */
async function rellenarSugerencias() {
  const lista = await ListaActividades.cargar(baseDatos);
  document.getElementById('listaRecursos').innerHTML = lista.recursos()
    .map((recurso) => `<option value="${escaparHtml(recurso)}">`).join('');
}

/* ---------- Estaciones ---------- */

/** Una casilla por estación, en el orden del curso (de otoño a verano). */
function pintarEstaciones() {
  document.getElementById('estaciones').innerHTML = ESTACIONES.map((estacion) => `
    <label class="casilla-estacion">
      <input type="checkbox" name="estacion" value="${estacion}" ${actividad.esDeEstacion(estacion) ? 'checked' : ''}>
      ${estacion}
    </label>`).join('');
}

function marcarTodasLasEstaciones(marcar) {
  formulario.querySelectorAll('input[name="estacion"]').forEach((casilla) => { casilla.checked = marcar; });
  hayCambios = true;
}

document.getElementById('botonTodoElAno').addEventListener('click', () => marcarTodasLasEstaciones(true));
document.getElementById('botonNingunaEstacion').addEventListener('click', () => marcarTodasLasEstaciones(false));

function leerEstaciones() {
  return [...formulario.querySelectorAll('input[name="estacion"]:checked')].map((casilla) => casilla.value);
}

/* ---------- Etapas ---------- */

/**
 * Un bloque por cada etapa posible: casilla para marcarla y, si está
 * marcada, sus saberes básicos y su adaptación.
 */
function pintarEtapas() {
  contenedorEtapas.innerHTML = ETAPAS.map((etapa, posicion) => {
    const datos = actividad.etapas.find((e) => e.etapa === etapa);
    return `
      <fieldset class="bloque-etapa" data-etapa="${escaparHtml(etapa)}">
        <legend>
          <label><input type="checkbox" name="etapa-${posicion}" ${datos ? 'checked' : ''}> ${escaparHtml(etapa)}</label>
        </legend>
        <div class="bloque-etapa-campos" ${datos ? '' : 'hidden'}>
          <label class="campo">
            <span>Saberes básicos</span>
            <textarea name="saberes-${posicion}" rows="4">${escaparHtml((datos?.saberes ?? []).join('\n'))}</textarea>
            <small>Uno por línea, con el texto del currículo.</small>
          </label>
          <label class="campo">
            <span>Adaptación para esta etapa</span>
            <textarea name="adaptacion-${posicion}" rows="3">${escaparHtml(datos?.adaptacion ?? '')}</textarea>
          </label>
        </div>
      </fieldset>`;
  }).join('');
}

// Al marcar o desmarcar una etapa, se muestran u ocultan sus campos
contenedorEtapas.addEventListener('change', (evento) => {
  if (evento.target.type === 'checkbox') {
    const campos = evento.target.closest('fieldset').querySelector('.bloque-etapa-campos');
    campos.hidden = !evento.target.checked;
  }
});

function leerEtapas() {
  const lineas = (texto) => texto.split('\n').map((linea) => linea.trim()).filter(Boolean);
  return ETAPAS.flatMap((etapa, posicion) => {
    if (!formulario.elements[`etapa-${posicion}`].checked) return [];
    return [{
      etapa,
      saberes: lineas(formulario.elements[`saberes-${posicion}`].value),
      adaptacion: formulario.elements[`adaptacion-${posicion}`].value.trim(),
    }];
  });
}

/* ---------- Imágenes ---------- */

function pintarImagenes() {
  contenedorImagenes.innerHTML = imagenes.map((imagen, posicion) => `
    <div class="editor-imagen">
      <img src="${escaparHtml(imagen.src)}" alt="">
      <input type="text" data-posicion="${posicion}" value="${escaparHtml(imagen.texto)}" placeholder="Pie de foto (opcional)">
      <div class="editor-imagen-botones">
        <button type="button" class="boton-icono" data-mover="-1" data-posicion="${posicion}" title="Mover antes" ${posicion === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" class="boton-icono" data-mover="1" data-posicion="${posicion}" title="Mover después" ${posicion === imagenes.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" class="boton-icono" data-quitar data-posicion="${posicion}" title="Quitar imagen">×</button>
      </div>
    </div>`).join('');
  document.getElementById('contadorImagenes').textContent = `(${imagenes.length} de ${MAXIMO_IMAGENES})`;
  document.getElementById('botonAnadirImagenes').hidden = imagenes.length >= MAXIMO_IMAGENES;
}

contenedorImagenes.addEventListener('input', (evento) => {
  const posicion = evento.target.dataset.posicion;
  if (posicion !== undefined) {
    imagenes[posicion].texto = evento.target.value;
    hayCambios = true;
  }
});

contenedorImagenes.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;
  const posicion = Number(boton.dataset.posicion);
  if (boton.dataset.mover) {
    const destino = posicion + Number(boton.dataset.mover);
    [imagenes[posicion], imagenes[destino]] = [imagenes[destino], imagenes[posicion]];
  } else if (boton.hasAttribute('data-quitar')) {
    const [quitada] = imagenes.splice(posicion, 1);
    if (quitada.id && !quitada.datos) {
      idsImagenesQuitadas.push(quitada.id); // ya estaba guardada: se borrará
    }
  }
  hayCambios = true;
  pintarImagenes();
});

document.getElementById('ficheroImagenes').addEventListener('change', async (evento) => {
  const ficheros = [...evento.target.files].slice(0, MAXIMO_IMAGENES - imagenes.length);
  evento.target.value = '';
  textoError.textContent = ficheros.length ? 'Preparando imágenes…' : '';
  for (const fichero of ficheros) {
    try {
      const datos = await reducirImagen(fichero);
      imagenes.push({ id: baseDatos.nuevoId(), texto: '', src: datos, datos });
      hayCambios = true;
      pintarImagenes();
    } catch (error) {
      console.error(error);
      textoError.textContent = error.message;
      return;
    }
  }
  textoError.textContent = '';
});

/* ---------- Guardar y borrar ---------- */

function leerFormulario() {
  const nueva = new Actividad({ id: actividad.id ?? baseDatos.nuevoId() });
  for (const campo of CAMPOS_TEXTO) {
    nueva[campo] = formulario.elements[campo].value.trim();
  }
  for (const campo of CAMPOS_LISTA) {
    nueva[campo] = formulario.elements[campo].value.split('\n').map((linea) => linea.trim()).filter(Boolean);
  }
  nueva.etapas = leerEtapas();
  nueva.estaciones = leerEstaciones();
  nueva.imagenes = imagenes.map(({ id, ruta, texto }) => (ruta ? { ruta, texto } : { id, texto }));
  const ahora = new Date().toISOString();
  nueva.modificada = { por: usuario.correo, el: ahora };
  nueva.creada = actividad.creada ?? { por: usuario.correo, el: ahora };
  nueva.estado = estadoAlGuardar(usuario);
  // Si un revisor guarda una actividad que estaba pendiente, la está aprobando
  nueva.revisada = usuario.revisor && actividad.id && !actividad.estaPublicada
    ? { por: usuario.correo, el: ahora }
    : actividad.revisada;
  return nueva;
}

formulario.addEventListener('input', () => { hayCambios = true; });

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nueva = leerFormulario();
  const errores = nueva.errores();
  if (errores.length) {
    textoError.textContent = errores.join(' ');
    return;
  }

  const operaciones = [
    ...imagenes.filter((imagen) => imagen.datos).map((imagen) => ({
      tipo: 'guardar', coleccion: 'imagenes', id: imagen.id,
      datos: { actividadId: nueva.id, datos: imagen.datos, subidaPor: usuario.correo },
    })),
    ...idsImagenesQuitadas.map((id) => ({ tipo: 'borrar', coleccion: 'imagenes', id })),
    { tipo: 'guardar', coleccion: 'actividades', id: nueva.id, datos: nueva.aDocumento() },
  ];
  await guardar(operaciones, `actividad.html?id=${encodeURIComponent(nueva.id)}`);
});

document.getElementById('botonBorrar').addEventListener('click', async () => {
  if (!confirm(`¿Borrar la actividad «${actividad.titulo}» y sus imágenes? No se puede deshacer.`)) {
    return;
  }
  const operaciones = [
    ...actividad.imagenes.filter((imagen) => imagen.id)
      .map((imagen) => ({ tipo: 'borrar', coleccion: 'imagenes', id: imagen.id })),
    { tipo: 'borrar', coleccion: 'actividades', id: actividad.id },
  ];
  await guardar(operaciones, 'actividades.html');
});

async function guardar(operaciones, paginaSiguiente) {
  const botones = formulario.querySelectorAll('button');
  botones.forEach((boton) => { boton.disabled = true; });
  textoError.textContent = 'Guardando…';
  try {
    await baseDatos.aplicarCambios(operaciones);
    hayCambios = false;
    location.href = paginaSiguiente;
  } catch (error) {
    console.error(error);
    textoError.textContent = 'No se ha podido guardar. Comprueba la conexión y vuelve a probar.';
    botones.forEach((boton) => { boton.disabled = false; });
  }
}

// Aviso si se sale de la página sin guardar
window.addEventListener('beforeunload', (evento) => {
  if (hayCambios) evento.preventDefault();
});

try {
  await cargar();
} catch (error) {
  console.error(error);
  document.getElementById('tituloPagina').textContent = 'No se ha podido cargar la actividad.';
}
