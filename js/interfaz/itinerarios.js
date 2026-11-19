/*
 * itinerarios.js
 * --------------
 * Lista de itinerarios (itinerarios.html), solo para el profesorado con
 * sesión: los propios y los que ha compartido el resto. Cada uno con una
 * tira de colores, una raya por sesión con el color de la categoría de su
 * actividad, para ver de un vistazo cómo está repartido.
 *
 * Desde aquí se crea un itinerario nuevo (nombre, etapa y curso); las
 * fechas y las actividades se ponen en su página (itinerario.html).
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { ETAPAS } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { Itinerario } from '../modelo/Itinerario.js';
import { categoriaPorId } from '../modelo/categorias.js';
import { cursoDe, fechaMedia, textoFecha } from '../modelo/fechas.js';
import { Sesion } from './Sesion.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';

const baseDatos = BaseDatos.preparar();
const $ = (idElemento) => document.getElementById(idElemento);

await Sesion.proteger();
const usuario = await Barra.pintar();

let itinerarios = [];
let lista = null;

function htmlItinerario(itinerario) {
  const categoriaDe = (sesion) =>
    categoriaPorId(lista.actividades.find((a) => a.id === sesion.actividadId)?.categoria);
  const tira = itinerario.sesiones.map((sesion) => {
    const categoria = categoriaDe(sesion);
    return `<span class="tira-sesion" style="background: ${categoria ? `var(--cat-${categoria.id})` : 'var(--color-borde)'}"
      title="${fechaMedia(sesion.fecha)}"></span>`;
  }).join('');
  const fechas = itinerario.primeraFecha
    ? `${fechaMedia(itinerario.primeraFecha)} – ${fechaMedia(itinerario.ultimaFecha)}`
    : 'Sin fechas';
  return `
    <a class="tarjeta tarjeta-itinerario" href="itinerario.html?id=${encodeURIComponent(itinerario.id)}">
      <strong>${escaparHtml(itinerario.nombre)}</strong>
      <span class="itinerario-datos">
        <span class="etiqueta">${escaparHtml(itinerario.etapa)}</span>
        <span>${escaparHtml(itinerario.curso)}</span>
        ${itinerario.esDe(usuario.correo)
          ? `<span class="${itinerario.compartido ? 'marca-compartido' : 'marca-privado'}">${itinerario.compartido ? 'Compartido' : 'Privado'}</span>`
          : `<span class="sin-dato">${escaparHtml(itinerario.propietario)}</span>`}
      </span>
      <span class="tira" aria-hidden="true">${tira}</span>
      <span class="sin-dato">${escaparHtml(fechas)} · ${itinerario.sesiones.length} sesiones, ${itinerario.sesionesConActividad} con actividad</span>
    </a>`;
}

function pintar() {
  const etapa = $('filtroEtapa').value;
  const elegidos = itinerarios.filter((i) => !etapa || i.etapa === etapa);
  const mios = elegidos.filter((i) => i.esDe(usuario.correo));
  const compartidos = elegidos.filter((i) => !i.esDe(usuario.correo));
  $('listaMios').innerHTML = mios.map(htmlItinerario).join('')
    || '<p class="resultado">Aún no tienes ninguno. Crea uno nuevo o copia uno compartido.</p>';
  $('listaCompartidos').innerHTML = compartidos.map(htmlItinerario).join('')
    || '<p class="resultado">Nadie más ha compartido itinerarios todavía.</p>';
}

// Crear un itinerario nuevo y abrirlo
$('formularioNuevo').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const formulario = evento.target;
  const itinerario = new Itinerario({
    id: baseDatos.nuevoId(),
    nombre: formulario.nombre.value.trim(),
    etapa: formulario.etapa.value,
    curso: formulario.curso.value.trim(),
    creada: { por: usuario.correo, el: new Date().toISOString() },
  });
  const errores = itinerario.errores();
  if (errores.length) {
    $('errorNuevo').textContent = errores.join(' ');
    return;
  }
  try {
    await baseDatos.aplicarCambios([
      { tipo: 'guardar', coleccion: 'itinerarios', id: itinerario.id, datos: itinerario.aDocumento() },
    ]);
    location.href = `itinerario.html?id=${encodeURIComponent(itinerario.id)}`;
  } catch (error) {
    console.error(error);
    $('errorNuevo').textContent = 'No se ha podido crear. Vuelve a probar.';
  }
});

const opcionesEtapas = ETAPAS.map((e) => `<option>${escaparHtml(e)}</option>`).join('');
$('etapaNuevo').innerHTML = opcionesEtapas;
$('filtroEtapa').innerHTML = `<option value="">Todas</option>${opcionesEtapas}`;
$('filtroEtapa').addEventListener('change', pintar);
$('formularioNuevo').curso.value = cursoDe(textoFecha(new Date()));

try {
  [itinerarios, lista] = await Promise.all([
    Itinerario.cargarVisibles(baseDatos, usuario),
    ListaActividades.cargar(baseDatos, false),
  ]);
  pintar();
} catch (error) {
  console.error(error);
  $('listaMios').innerHTML = '<p class="resultado">No se han podido cargar los itinerarios.</p>';
}
