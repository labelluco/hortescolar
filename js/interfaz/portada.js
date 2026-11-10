/*
 * portada.js
 * ----------
 * Página principal (index.html): tabla de actividades con buscador, filtros
 * por etapa y por estación, y columnas ordenables. Al hacer clic en una fila se
 * abre su ficha.
 *
 * Cada fila lleva el color de su categoría. La leyenda de categorías es
 * también un filtro: al pulsar una, solo se ven las de esa categoría.
 *
 * Para no saturar la tabla, la columna de saberes muestra solo las áreas
 * (Ciencias de la Naturaleza, Matemáticas…). Si se busca un texto, debajo
 * aparecen los saberes que coinciden. Si se elige una etapa, solo cuentan
 * los saberes de esa etapa.
 *
 * La búsqueda se guarda en la dirección (?q=huellas&en=recurso&etapa=…&estacion=Otoño&categoria=cultivo),
 * así que al volver atrás desde una ficha se conserva, y se puede compartir.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad, ETAPAS } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { ESTACIONES, estacionDe } from '../modelo/estaciones.js';
import { CATEGORIAS, categoriaPorId } from '../modelo/categorias.js';
import { partirSaber } from '../modelo/saber.js';
import { OrdenTabla } from './OrdenTabla.js';
import { Barra } from './Barra.js';
import { estacionesHtml } from './estacionesHtml.js';
import { categoriaHtml } from './categoriaHtml.js';
import { escaparHtml } from './ayudas.js';

Barra.pintar();

const campoBusqueda = document.getElementById('busqueda');
const campoBuscarEn = document.getElementById('buscarEn');
const campoEtapa = document.getElementById('etapa');
const campoEstacion = document.getElementById('estacion');
const leyenda = document.getElementById('categorias');
const cuerpo = document.getElementById('filas');
const resultado = document.getElementById('resultado');

campoEtapa.innerHTML = '<option value="">Todas las etapas</option>'
  + ETAPAS.map((etapa) => `<option>${escaparHtml(etapa)}</option>`).join('');

// «Esta estación» va primero; tiene el mismo valor que su estación en la lista
const estacionDeHoy = estacionDe();
campoEstacion.innerHTML = '<option value="">Cualquier época</option>'
  + `<option value="${estacionDeHoy}">Esta estación (${estacionDeHoy.toLowerCase()})</option>`
  + ESTACIONES.map((estacion) => `<option value="${estacion}">${estacion}</option>`).join('');

let lista = null;
let categoriaElegida = null; // id, o null para todas

/** La leyenda: un botón por categoría, que filtra al pulsarlo (y quita el filtro si ya estaba). */
function pintarLeyenda() {
  leyenda.innerHTML = CATEGORIAS.map((categoria) => `
    <button type="button" class="leyenda-boton" data-categoria="${categoria.id}"
            aria-pressed="${categoria.id === categoriaElegida}">${categoriaHtml(categoria.id)}</button>`).join('');
  leyenda.classList.toggle('con-filtro', Boolean(categoriaElegida));
}

leyenda.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-categoria]');
  if (!boton) return;
  categoriaElegida = categoriaElegida === boton.dataset.categoria ? null : boton.dataset.categoria;
  pintarLeyenda();
  pintar();
});

const orden = new OrdenTabla(document.getElementById('tabla'), {
  recurso: (a) => a.recurso,
  titulo: (a) => a.titulo,
  saberes: (a) => a.areasDe(campoEtapa.value || null).join(' · '),
  etapa: (a) => Math.min(...a.nombresEtapas.map(Actividad.posicionEtapa)),
  epoca: (a) => a.primeraEstacion,
}, pintar);

/** Enlace a la ficha; con la etapa elegida, para que la abra desplegada. */
function direccionFicha(actividad, etapa) {
  const parametros = new URLSearchParams({ id: actividad.id });
  if (etapa) parametros.set('etapa', etapa);
  return `actividad.html?${parametros}`;
}

/** Nombre corto de una etapa para las etiquetas: «Primaria · 2.º ciclo» → «2.º ciclo». */
function etapaCorta(etapa) {
  return etapa.replace(/^Primaria · /, '');
}

/**
 * Áreas de la actividad y, si hay búsqueda, los saberes que coinciden,
 * cada uno con la etapa o etapas (ciclos) en que aparece.
 */
function celdaSaberes(actividad, texto, campo, etapa) {
  const areas = actividad.areasDe(etapa)
    .map((area) => `<span class="etiqueta etiqueta-area">${escaparHtml(area)}</span>`).join(' ');
  const buscaSaberes = campo === 'todo' || campo === 'saberes';
  const coinciden = buscaSaberes ? ListaActividades.saberesQueCoinciden(actividad, texto, etapa) : [];
  const lista = coinciden.length
    ? `<ul class="lista-saberes">${coinciden.map(({ saber, etapas }) => `
        <li>
          ${etapas.map((e) => `<span class="etiqueta etiqueta-etapa">${escaparHtml(etapaCorta(e))}</span>`).join(' ')}
          ${escaparHtml(partirSaber(saber).texto)}
        </li>`).join('')}</ul>`
    : '';
  return areas + lista;
}

function pintar() {
  const texto = campoBusqueda.value;
  const campo = campoBuscarEn.value;
  const etapa = campoEtapa.value || null;
  const estacion = campoEstacion.value || null;
  const encontradas = orden.ordenar(lista.buscar(texto, campo, etapa, estacion, categoriaElegida));

  cuerpo.innerHTML = encontradas.map((a) => `
    <tr class="fila-enlace" style="--color-categoria: var(--cat-${escaparHtml(a.categoria || 'ninguna')})">
      <td>${escaparHtml(a.recurso)}</td>
      <td>
        <a href="${direccionFicha(a, etapa)}">${escaparHtml(a.titulo)}</a>
        <div>${categoriaHtml(a.categoria)}</div>
      </td>
      <td>${celdaSaberes(a, texto, campo, etapa)}</td>
      <td>${a.nombresEtapas.map((e) => `<span class="etiqueta">${escaparHtml(e)}</span>`).join(' ')}</td>
      <td>${estacionesHtml(a.estaciones)}</td>
    </tr>`).join('');

  if (encontradas.length === 0) {
    const aviso = lista.total === 0 ? 'Todavía no hay ninguna actividad.' : 'No hay ninguna actividad con esa búsqueda.';
    cuerpo.innerHTML = `<tr><td colspan="5" class="vacio">${aviso}</td></tr>`;
  }
  resultado.textContent = texto.trim() || etapa || estacion || categoriaElegida
    ? `${encontradas.length} de ${lista.total} actividades`
    : `${lista.total} actividades`;

  guardarEnDireccion(texto, campo, etapa, estacion, categoriaElegida);
}

function guardarEnDireccion(texto, campo, etapa, estacion, categoria) {
  const parametros = new URLSearchParams();
  if (texto.trim()) parametros.set('q', texto.trim());
  if (campo !== 'todo') parametros.set('en', campo);
  if (etapa) parametros.set('etapa', etapa);
  if (estacion) parametros.set('estacion', estacion);
  if (categoria) parametros.set('categoria', categoria);
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
  const estacion = parametros.get('estacion');
  if (estacion && ESTACIONES.includes(estacion)) {
    campoEstacion.value = estacion;
  }
  const categoria = parametros.get('categoria');
  categoriaElegida = categoriaPorId(categoria) ? categoria : null;
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
campoEstacion.addEventListener('change', pintar);

try {
  lista = await ListaActividades.cargar(BaseDatos.preparar());
  leerDeDireccion();
  pintarLeyenda();
  pintar();
} catch (error) {
  console.error(error);
  resultado.textContent = 'No se han podido cargar las actividades.';
}
