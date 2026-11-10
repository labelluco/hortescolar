/*
 * portada.js
 * ----------
 * Página principal (index.html): tabla de actividades con buscador, filtro
 * por etapa y columnas ordenables. Al hacer clic en una fila se abre su ficha.
 *
 * Si se elige una etapa, la columna de saberes muestra solo los de esa etapa.
 *
 * La búsqueda se guarda en la dirección (?q=huellas&en=recurso&etapa=…), así
 * que al volver atrás desde una ficha se conserva, y se puede compartir.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad, ETAPAS } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { OrdenTabla } from './OrdenTabla.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';

Barra.pintar();

// Cuántos saberes se ven en la tabla antes de resumir con «y N más»
const SABERES_VISIBLES = 4;

const campoBusqueda = document.getElementById('busqueda');
const campoBuscarEn = document.getElementById('buscarEn');
const campoEtapa = document.getElementById('etapa');
const cuerpo = document.getElementById('filas');
const resultado = document.getElementById('resultado');

campoEtapa.innerHTML = '<option value="">Todas las etapas</option>'
  + ETAPAS.map((etapa) => `<option>${escaparHtml(etapa)}</option>`).join('');

let lista = null;

const orden = new OrdenTabla(document.getElementById('tabla'), {
  recurso: (a) => a.recurso,
  titulo: (a) => a.titulo,
  saberes: (a) => a.saberesDe(campoEtapa.value || null).join(' · '),
  etapa: (a) => Math.min(...a.nombresEtapas.map(Actividad.posicionEtapa)),
}, pintar);

function celdaSaberes(saberes) {
  const visibles = saberes.slice(0, SABERES_VISIBLES)
    .map((s) => `<li>${escaparHtml(s)}</li>`).join('');
  const resto = saberes.length - SABERES_VISIBLES;
  return `<ul class="lista-saberes">${visibles}</ul>${resto > 0 ? `<span class="mas">y ${resto} más</span>` : ''}`;
}

/** Enlace a la ficha; con la etapa elegida, para que la abra desplegada. */
function direccionFicha(actividad, etapa) {
  const parametros = new URLSearchParams({ id: actividad.id });
  if (etapa) parametros.set('etapa', etapa);
  return `actividad.html?${parametros}`;
}

function pintar() {
  const texto = campoBusqueda.value;
  const campo = campoBuscarEn.value;
  const etapa = campoEtapa.value || null;
  const encontradas = orden.ordenar(lista.buscar(texto, campo, etapa));

  cuerpo.innerHTML = encontradas.map((a) => `
    <tr class="fila-enlace">
      <td>${escaparHtml(a.recurso)}</td>
      <td><a href="${direccionFicha(a, etapa)}">${escaparHtml(a.titulo)}</a></td>
      <td>${celdaSaberes(a.saberesDe(etapa))}</td>
      <td>${a.nombresEtapas.map((e) => `<span class="etiqueta">${escaparHtml(e)}</span>`).join(' ')}</td>
    </tr>`).join('');

  if (encontradas.length === 0) {
    const aviso = lista.total === 0 ? 'Todavía no hay ninguna actividad.' : 'No hay ninguna actividad con esa búsqueda.';
    cuerpo.innerHTML = `<tr><td colspan="4" class="vacio">${aviso}</td></tr>`;
  }
  resultado.textContent = texto.trim() || etapa
    ? `${encontradas.length} de ${lista.total} actividades`
    : `${lista.total} actividades`;

  guardarEnDireccion(texto, campo, etapa);
}

function guardarEnDireccion(texto, campo, etapa) {
  const parametros = new URLSearchParams();
  if (texto.trim()) parametros.set('q', texto.trim());
  if (campo !== 'todo') parametros.set('en', campo);
  if (etapa) parametros.set('etapa', etapa);
  const consulta = parametros.toString();
  history.replaceState(null, '', consulta ? `?${consulta}` : location.pathname);
}

function leerDeDireccion() {
  const parametros = new URLSearchParams(location.search);
  campoBusqueda.value = parametros.get('q') ?? '';
  const campo = parametros.get('en');
  if (campo && [...campoBuscarEn.options].some((o) => o.value === campo)) {
    campoBuscarEn.value = campo;
  }
  const etapa = parametros.get('etapa');
  if (etapa && ETAPAS.includes(etapa)) {
    campoEtapa.value = etapa;
  }
}

// Toda la fila se puede pulsar, no solo el enlace del título.
cuerpo.addEventListener('click', (evento) => {
  const fila = evento.target.closest('tr.fila-enlace');
  if (fila && !evento.target.closest('a')) {
    location.href = fila.querySelector('a').href;
  }
});

document.getElementById('buscador').addEventListener('submit', (evento) => evento.preventDefault());
campoBusqueda.addEventListener('input', pintar);
campoBuscarEn.addEventListener('change', pintar);
campoEtapa.addEventListener('change', pintar);

try {
  lista = await ListaActividades.cargar(BaseDatos.preparar());
  leerDeDireccion();
  pintar();
} catch (error) {
  console.error(error);
  resultado.textContent = 'No se han podido cargar las actividades.';
}
