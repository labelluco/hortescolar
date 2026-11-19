/*
 * itinerario.js
 * -------------
 * Página de un itinerario (itinerario.html?id=…), solo para el profesorado
 * con sesión. Enseña:
 *
 *   Calendario  las sesiones por meses, cada una con el color de la
 *               categoría de su actividad (en blanco si aún no tiene) y,
 *               si la actividad ocupa varias sesiones, cuál es (2/3).
 *   Equilibrio  cuántas sesiones hay de cada categoría y de cada área, y
 *               avisos: actividades fuera de su época o de otra etapa.
 *   Sesiones    la lista de fechas con su actividad y una nota.
 *
 * Quien lo creó, además, puede añadir fechas (una o periódicas), elegir la
 * actividad de cada día (solo las de la etapa del itinerario), quitar
 * fechas, cambiar los datos y borrarlo. Cada cambio se guarda en el acto.
 * Cualquiera que lo vea puede hacer una copia para sí.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { ETAPAS } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { Itinerario } from '../modelo/Itinerario.js';
import { CATEGORIAS, categoriaPorId } from '../modelo/categorias.js';
import { estacionDe, textoEstaciones } from '../modelo/estaciones.js';
import { fechaCorta, fechaLarga, mesCorto, fechasPeriodicas, leerFecha, mesDe } from '../modelo/fechas.js';
import { puedeEditarItinerario, puedeVerItinerario } from '../modelo/permisos.js';
import { compararTextos } from '../modelo/texto.js';
import { Sesion } from './Sesion.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';

const baseDatos = BaseDatos.preparar();
const id = new URLSearchParams(location.search).get('id');
const $ = (idElemento) => document.getElementById(idElemento);

await Sesion.proteger();
const usuario = await Barra.pintar();

let itinerario = null;
let lista = null;          // todas las actividades (ListaActividades)
let editable = false;      // ¿es de quien mira?

// ---------- Ayudas ----------

function actividadDe(actividadId) {
  return lista.actividades.find((a) => a.id === actividadId) ?? null;
}

/** Estilo con el color de la categoría de una actividad (o nada). */
function estiloCategoria(actividad) {
  const categoria = categoriaPorId(actividad?.categoria);
  return categoria ? `style="--color-categoria: var(--cat-${categoria.id})"` : '';
}

/** Avisos de una sesión: actividad de otra etapa, fuera de época o que ya no existe. */
function avisosDe(sesion) {
  if (!sesion.actividadId) return [];
  const actividad = actividadDe(sesion.actividadId);
  if (!actividad) return ['La actividad ya no existe.'];
  const avisos = [];
  if (!actividad.tieneEtapa(itinerario.etapa)) {
    avisos.push(`No es de ${itinerario.etapa}.`);
  }
  const estacion = estacionDe(leerFecha(sesion.fecha));
  if (actividad.estaciones.length && !actividad.esDeEstacion(estacion)) {
    avisos.push(`Es de ${textoEstaciones(actividad.estaciones).toLowerCase()} y el ${fechaCorta(sesion.fecha)} es ${estacion.toLowerCase()}.`);
  }
  return avisos;
}

// ---------- Cabecera ----------

function pintarCabecera() {
  document.title = `${itinerario.nombre} · ERA`;
  const fechas = itinerario.primeraFecha
    ? `del ${fechaLarga(itinerario.primeraFecha)} al ${fechaLarga(itinerario.ultimaFecha)}`
    : 'sin fechas todavía';
  $('cabecera').innerHTML = `
    <h1>${escaparHtml(itinerario.nombre)}</h1>
    <p class="itinerario-datos">
      <span class="etiqueta">${escaparHtml(itinerario.etapa)}</span>
      <span>Curso ${escaparHtml(itinerario.curso)}</span>
      <span class="${itinerario.compartido ? 'marca-compartido' : 'marca-privado'}">${itinerario.compartido ? 'Compartido' : 'Privado'}</span>
      <span class="sin-dato">${editable ? 'Tuyo' : `De ${escaparHtml(itinerario.propietario)}`} · ${fechas}</span>
    </p>
    ${itinerario.descripcion ? `<p>${escaparHtml(itinerario.descripcion)}</p>` : ''}`;
}

// ---------- Calendario ----------

function pintarCalendario() {
  const numeros = itinerario.numeracion();
  const meses = new Map(); // «Octubre 2026» → [sesiones]
  for (const sesion of itinerario.sesiones) {
    const mes = mesDe(sesion.fecha);
    meses.set(mes, [...(meses.get(mes) ?? []), sesion]);
  }

  $('consejoCalendario').textContent = itinerario.sesiones.length === 0
    ? (editable ? 'Aún no hay sesiones: añade las fechas más abajo.' : 'Aún no hay sesiones.')
    : 'Pasa por encima de una sesión para ver las otras de la misma actividad.'
      + (editable ? ' Haz clic para cambiar su actividad.' : ' Haz clic para ver la actividad.');

  $('calendario').innerHTML = [...meses].map(([mes, sesiones]) => `
    <div class="mes">
      <h3 class="mes-nombre">${escaparHtml(mes)}</h3>
      <div class="mes-sesiones">${sesiones.map((s) => htmlCasilla(s, numeros.get(s.id))).join('')}</div>
    </div>`).join('');
}

function htmlCasilla(sesion, numero) {
  const actividad = actividadDe(sesion.actividadId);
  const avisos = avisosDe(sesion);
  const titulo = actividad?.titulo ?? (sesion.actividadId ? 'Actividad que ya no existe' : 'Sin actividad');
  const ayuda = [fechaLarga(sesion.fecha), titulo, sesion.nota, ...avisos].filter(Boolean).join('\n');
  return `
    <button type="button" class="casilla-sesion${sesion.actividadId ? '' : ' vacia'}"
      data-sesion="${escaparHtml(sesion.id)}" data-actividad="${escaparHtml(sesion.actividadId)}"
      ${estiloCategoria(actividad)} title="${escaparHtml(ayuda)}">
      <span class="casilla-fecha">${fechaCorta(sesion.fecha)}
        ${numero && numero.total > 1 ? `<span class="casilla-numero">${numero.numero}/${numero.total}</span>` : ''}
        ${avisos.length ? '<span class="casilla-aviso" aria-label="Con avisos">⚠</span>' : ''}
      </span>
      <span class="casilla-titulo">${escaparHtml(titulo)}</span>
      ${sesion.nota ? `<span class="casilla-nota">${escaparHtml(sesion.nota)}</span>` : ''}
    </button>`;
}

// Al pasar por encima de una sesión se resaltan las de la misma actividad
$('calendario').addEventListener('mouseover', (evento) => {
  const actividadId = evento.target.closest('.casilla-sesion')?.dataset.actividad;
  $('calendario').querySelectorAll('.casilla-sesion').forEach((casilla) => {
    casilla.classList.toggle('resaltada', Boolean(actividadId) && casilla.dataset.actividad === actividadId);
  });
  $('calendario').classList.toggle('con-resalte', Boolean(actividadId));
});
$('calendario').addEventListener('mouseleave', () => $('calendario').classList.remove('con-resalte'));

$('calendario').addEventListener('click', (evento) => {
  const casilla = evento.target.closest('.casilla-sesion');
  if (!casilla) return;
  if (editable) {
    const fila = $('sesiones').querySelector(`tr[data-sesion="${casilla.dataset.sesion}"]`);
    fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fila.querySelector('select').focus({ preventScroll: true });
  } else if (casilla.dataset.actividad) {
    location.href = enlaceActividad(casilla.dataset.actividad);
  }
});

function enlaceActividad(actividadId) {
  return `actividad.html?id=${encodeURIComponent(actividadId)}&etapa=${encodeURIComponent(itinerario.etapa)}`;
}

// ---------- Equilibrio ----------

function pintarEquilibrio() {
  const conActividad = itinerario.sesiones.filter((s) => actividadDe(s.actividadId));
  const distintas = new Set(conActividad.map((s) => s.actividadId)).size;
  const vacias = itinerario.sesiones.length - itinerario.sesionesConActividad;
  $('resumen').innerHTML = `<strong>${itinerario.sesiones.length}</strong> sesiones · `
    + `<strong>${distintas}</strong> actividades distintas`
    + (vacias ? ` · <strong>${vacias}</strong> sin actividad` : '');

  // Por categoría: todas, también las que no salen (para ver qué falta)
  const porCategoria = CATEGORIAS.map((categoria) => ({
    nombre: categoria.nombre,
    color: `var(--cat-${categoria.id})`,
    cuantas: conActividad.filter((s) => actividadDe(s.actividadId).categoria === categoria.id).length,
  }));
  $('barrasCategorias').innerHTML = htmlBarras(porCategoria);

  // Por área: las de todas las actividades de la etapa, para ver las que faltan
  const etapa = itinerario.etapa;
  const areas = new Set(lista.buscar('', 'todo', etapa).flatMap((a) => a.areasDe(etapa)));
  const porArea = [...areas].map((area) => ({
    nombre: area,
    color: 'var(--color-principal)',
    cuantas: conActividad.filter((s) => actividadDe(s.actividadId).areasDe(etapa).includes(area)).length,
  })).sort((a, b) => b.cuantas - a.cuantas || compararTextos(a.nombre, b.nombre));
  $('barrasAreas').innerHTML = htmlBarras(porArea);

  // Avisos de todas las sesiones
  const avisos = itinerario.sesiones.flatMap((s) => avisosDe(s).map((aviso) =>
    `<li><strong>${fechaCorta(s.fecha)}</strong> · ${escaparHtml(actividadDe(s.actividadId)?.titulo ?? '')}: ${escaparHtml(aviso)}</li>`));
  $('avisos').innerHTML = avisos.length
    ? `<div class="aviso aviso-revision"><p><strong>⚠ Para revisar</strong></p><ul>${avisos.join('')}</ul></div>`
    : '';
}

/** Barras horizontales: [{ nombre, color, cuantas }]. La más larga ocupa todo el ancho. */
function htmlBarras(filas) {
  const maximo = Math.max(1, ...filas.map((f) => f.cuantas));
  return `<ul class="grafica">${filas.map((f) => `
    <li class="${f.cuantas ? '' : 'grafica-cero'}">
      <span class="grafica-nombre">${escaparHtml(f.nombre)}</span>
      <span class="grafica-pista"><span class="grafica-relleno" style="width: ${(100 * f.cuantas) / maximo}%; background: ${f.color}"></span></span>
      <span class="grafica-cuantas">${f.cuantas}</span>
    </li>`).join('')}</ul>`;
}

// ---------- Sesiones ----------

/** Desplegable de actividades de la etapa, agrupadas por categoría. */
function htmlSelector(sesion) {
  const deLaEtapa = lista.buscar('', 'todo', itinerario.etapa);
  const grupos = CATEGORIAS.map((categoria) => {
    const actividades = deLaEtapa.filter((a) => a.categoria === categoria.id)
      .sort((a, b) => compararTextos(a.titulo, b.titulo));
    if (actividades.length === 0) return '';
    return `<optgroup label="${escaparHtml(categoria.nombre)}">${actividades.map((a) => `
      <option value="${escaparHtml(a.id)}" ${a.id === sesion.actividadId ? 'selected' : ''}>
        ${escaparHtml(a.titulo)}${a.estaPublicada ? '' : ' (pendiente de revisión)'}</option>`).join('')}</optgroup>`;
  }).join('');
  // Si la actividad elegida ya no es de la etapa (o no existe), se mantiene con aviso
  const fuera = sesion.actividadId && !deLaEtapa.some((a) => a.id === sesion.actividadId)
    ? `<option value="${escaparHtml(sesion.actividadId)}" selected>⚠ ${escaparHtml(actividadDe(sesion.actividadId)?.titulo ?? 'Actividad que ya no existe')}</option>`
    : '';
  return `<select data-campo="actividadId" aria-label="Actividad del ${fechaCorta(sesion.fecha)}">
    <option value="">— Sin actividad —</option>${fuera}${grupos}</select>`;
}

function pintarSesiones() {
  const numeros = itinerario.numeracion();
  $('sesiones').innerHTML = itinerario.sesiones.map((sesion) => {
    const actividad = actividadDe(sesion.actividadId);
    const numero = numeros.get(sesion.id);
    const enlace = actividad
      ? `<a href="${enlaceActividad(actividad.id)}" title="Ver la ficha">${editable ? 'ficha ↗' : escaparHtml(actividad.titulo)}</a>`
      : '';
    const sesionN = numero && numero.total > 1 ? `<span class="casilla-numero">${numero.numero}/${numero.total}</span>` : '';
    if (!editable) {
      return `<tr data-sesion="${escaparHtml(sesion.id)}" ${estiloCategoria(actividad)} class="fila-sesion">
        <td>${fechaCorta(sesion.fecha)} <small>${mesCorto(sesion.fecha)}</small></td>
        <td>${enlace || '<span class="sin-dato">Sin actividad</span>'} ${sesionN}</td>
        <td>${escaparHtml(sesion.nota)}</td><td></td></tr>`;
    }
    return `<tr data-sesion="${escaparHtml(sesion.id)}" ${estiloCategoria(actividad)} class="fila-sesion">
      <td>${fechaCorta(sesion.fecha)} <small>${mesCorto(sesion.fecha)}</small></td>
      <td><div class="sesion-actividad">${htmlSelector(sesion)} ${sesionN} ${enlace}</div></td>
      <td><input type="text" data-campo="nota" value="${escaparHtml(sesion.nota)}" placeholder="Qué se hace ese día…" aria-label="Nota del ${fechaCorta(sesion.fecha)}"></td>
      <td><button type="button" class="boton-icono" data-quitar title="Quitar esta fecha" aria-label="Quitar el ${fechaCorta(sesion.fecha)}">×</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="vacio">Sin sesiones.</td></tr>';
}

// Cambiar la actividad o la nota de una sesión
$('sesiones').addEventListener('change', async (evento) => {
  const campo = evento.target.dataset.campo;
  const fila = evento.target.closest('tr');
  if (!campo || !fila) return;
  itinerario.sesion(fila.dataset.sesion)[campo] = evento.target.value.trim();
  if (campo === 'actividadId') {
    // Repinta la fila (color, 2/3, enlace) y devuelve el foco al desplegable
    pintarSesiones();
    $('sesiones').querySelector(`tr[data-sesion="${fila.dataset.sesion}"] select`).focus();
  }
  pintarCalendario();
  pintarEquilibrio();
  await guardar();
});

// Quitar una fecha
$('sesiones').addEventListener('click', async (evento) => {
  if (!evento.target.matches('[data-quitar]')) return;
  itinerario.quitarSesion(evento.target.closest('tr').dataset.sesion);
  pintarTodo();
  await guardar();
});

// Añadir una fecha
$('formularioFecha').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  itinerario.anadirFechas([evento.target.fecha.value]);
  evento.target.reset();
  pintarTodo();
  await guardar();
});

// Añadir fechas periódicas: «los martes y jueves del 1 de octubre al 20 de diciembre»
$('formularioPeriodicas').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const formulario = evento.target;
  const dias = [...formulario.querySelectorAll('[name=dia]:checked')].map((c) => Number(c.value));
  if (dias.length === 0) {
    mostrarEstado('Marca al menos un día de la semana.', true);
    return;
  }
  if (formulario.hasta.value < formulario.desde.value) {
    mostrarEstado('La fecha «hasta» es anterior a «desde».', true);
    return;
  }
  itinerario.anadirFechas(fechasPeriodicas(formulario.desde.value, formulario.hasta.value, dias));
  pintarTodo();
  await guardar();
});

// ---------- Guardar, copiar y borrar ----------

function mostrarEstado(texto, esError = false) {
  $('estadoGuardado').textContent = texto;
  $('estadoGuardado').classList.toggle('error', esError);
}

async function guardar() {
  mostrarEstado('Guardando…');
  itinerario.modificada = { por: usuario.correo, el: new Date().toISOString() };
  try {
    await baseDatos.aplicarCambios([
      { tipo: 'guardar', coleccion: 'itinerarios', id: itinerario.id, datos: itinerario.aDocumento() },
    ]);
    mostrarEstado('Guardado ✓');
  } catch (error) {
    console.error(error);
    mostrarEstado('No se ha podido guardar. Vuelve a probar.', true);
  }
}

/**
 * Abre el diálogo para cambiar los datos (modo 'datos') o para hacer una
 * copia (modo 'copia', con nombre y curso nuevos).
 */
function abrirDialogo(modo) {
  const formulario = $('formularioDialogo');
  const copia = modo === 'copia';
  formulario.dataset.modo = modo;
  $('tituloDialogo').textContent = copia ? 'Hacer una copia' : 'Datos del itinerario';
  formulario.nombre.value = copia ? `Copia de ${itinerario.nombre}` : itinerario.nombre;
  formulario.etapa.value = itinerario.etapa;
  formulario.etapa.disabled = copia; // la copia es de la misma etapa
  formulario.curso.value = itinerario.curso;
  formulario.descripcion.value = itinerario.descripcion;
  formulario.compartido.checked = itinerario.compartido;
  $('campoDescripcion').hidden = copia;
  $('campoCompartido').hidden = copia;
  $('consejoDialogo').textContent = copia
    ? 'La copia será tuya y privada. Si cambias el curso, las fechas pasan al mismo día de la semana del curso nuevo: revisa luego los festivos.'
    : '';
  $('errorDialogo').textContent = '';
  $('dialogo').showModal();
}

$('formularioDialogo').addEventListener('submit', async (evento) => {
  if (evento.submitter?.value === 'cancelar') return; // se cierra sin más
  evento.preventDefault();
  const formulario = evento.target;
  const datos = {
    nombre: formulario.nombre.value.trim(),
    curso: formulario.curso.value.trim(),
  };
  if (formulario.dataset.modo === 'copia') {
    await copiar(datos);
    return;
  }
  const antes = new Itinerario({ ...itinerario.aDocumento(), id: itinerario.id });
  Object.assign(itinerario, datos, {
    etapa: formulario.etapa.value,
    descripcion: formulario.descripcion.value.trim(),
    compartido: formulario.compartido.checked,
  });
  const errores = itinerario.errores();
  if (errores.length) {
    Object.assign(itinerario, antes);
    $('errorDialogo').textContent = errores.join(' ');
    return;
  }
  $('dialogo').close();
  pintarTodo();
  await guardar();
});

async function copiar({ nombre, curso }) {
  const copia = itinerario.copiar(nombre, curso);
  copia.id = baseDatos.nuevoId();
  copia.creada = { por: usuario.correo, el: new Date().toISOString() };
  const errores = copia.errores();
  if (errores.length) {
    $('errorDialogo').textContent = errores.join(' ');
    return;
  }
  try {
    await baseDatos.aplicarCambios([
      { tipo: 'guardar', coleccion: 'itinerarios', id: copia.id, datos: copia.aDocumento() },
    ]);
    location.href = `itinerario.html?id=${encodeURIComponent(copia.id)}`;
  } catch (error) {
    console.error(error);
    $('errorDialogo').textContent = 'No se ha podido hacer la copia. Vuelve a probar.';
  }
}

$('botonDatos').addEventListener('click', () => abrirDialogo('datos'));
$('botonCopiar').addEventListener('click', () => abrirDialogo('copia'));

$('botonBorrar').addEventListener('click', async () => {
  if (!confirm(`¿Borrar el itinerario «${itinerario.nombre}»? No se puede deshacer.`)) return;
  try {
    await baseDatos.aplicarCambios([{ tipo: 'borrar', coleccion: 'itinerarios', id: itinerario.id }]);
    location.href = 'itinerarios.html';
  } catch (error) {
    console.error(error);
    alert('No se ha podido borrar. Vuelve a probar.');
  }
});

// ---------- Arranque ----------

function pintarTodo() {
  pintarCabecera();
  pintarCalendario();
  pintarEquilibrio();
  pintarSesiones();
}

$('etapaDialogo').innerHTML = ETAPAS.map((e) => `<option>${escaparHtml(e)}</option>`).join('');

try {
  [itinerario, lista] = await Promise.all([
    id ? Itinerario.leer(id, baseDatos) : null,
    ListaActividades.cargar(baseDatos, false),
  ]);
  if (!itinerario || !puedeVerItinerario(usuario, itinerario)) {
    $('cabecera').innerHTML = '<p class="resultado">No existe ese itinerario o no es compartido.</p>';
  } else {
    editable = puedeEditarItinerario(usuario, itinerario);
    for (const seccion of ['seccionCalendario', 'seccionEquilibrio', 'seccionSesiones', 'botonCopiar']) {
      $(seccion).hidden = false;
    }
    for (const parte of ['anadirFechas', 'botonDatos', 'zonaBorrar']) {
      $(parte).hidden = !editable;
    }
    pintarTodo();
  }
} catch (error) {
  console.error(error);
  $('cabecera').innerHTML = '<p class="resultado">No se ha podido cargar el itinerario.</p>';
}
