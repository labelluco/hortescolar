/*
 * portada.js
 * ----------
 * Página principal (index.html): tabla de actividades con buscador, filtros
 * por etapa y por época, y columnas ordenables. Al hacer clic en una fila se
 * abre su ficha.
 *
 * Para no saturar la tabla, la columna de saberes muestra solo las áreas
 * (Ciencias de la Naturaleza, Matemáticas…). Si se busca un texto, debajo
 * aparecen los saberes que coinciden. Si se elige una etapa, solo cuentan
 * los saberes de esa etapa.
 *
 * La búsqueda se guarda en la dirección (?q=huellas&en=recurso&etapa=…&mes=11),
 * así que al volver atrás desde una ficha se conserva, y se puede compartir.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { Actividad, ETAPAS } from '../modelo/Actividad.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { MESES_CURSO, mesActual, nombreMes } from '../modelo/calendario.js';
import { partirSaber } from '../modelo/saber.js';
import { OrdenTabla } from './OrdenTabla.js';
import { Barra } from './Barra.js';
import { calendarioHtml } from './calendarioHtml.js';
import { escaparHtml } from './ayudas.js';

Barra.pintar();

const campoBusqueda = document.getElementById('busqueda');
const campoBuscarEn = document.getElementById('buscarEn');
const campoEtapa = document.getElementById('etapa');
const campoMes = document.getElementById('mes');
const cuerpo = document.getElementById('filas');
const resultado = document.getElementById('resultado');

campoEtapa.innerHTML = '<option value="">Todas las etapas</option>'
  + ETAPAS.map((etapa) => `<option>${escaparHtml(etapa)}</option>`).join('');

const hoy = mesActual();
campoMes.innerHTML = '<option value="">Cualquier época</option>'
  + `<option value="${hoy}">Este mes (${nombreMes(hoy)})</option>`
  + MESES_CURSO.map((mes) => `<option value="${mes}">${nombreMes(mes)}</option>`).join('');

let lista = null;

const orden = new OrdenTabla(document.getElementById('tabla'), {
  recurso: (a) => a.recurso,
  titulo: (a) => a.titulo,
  saberes: (a) => a.areasDe(campoEtapa.value || null).join(' · '),
  etapa: (a) => Math.min(...a.nombresEtapas.map(Actividad.posicionEtapa)),
  epoca: (a) => a.primerMesDelCurso,
}, pintar);

/** Enlace a la ficha; con la etapa elegida, para que la abra desplegada. */
function direccionFicha(actividad, etapa) {
  const parametros = new URLSearchParams({ id: actividad.id });
  if (etapa) parametros.set('etapa', etapa);
  return `actividad.html?${parametros}`;
}

/** Áreas de la actividad y, si hay búsqueda, los saberes que coinciden. */
function celdaSaberes(actividad, texto, campo, etapa) {
  const areas = actividad.areasDe(etapa)
    .map((area) => `<span class="etiqueta etiqueta-area">${escaparHtml(area)}</span>`).join(' ');
  const buscaSaberes = campo === 'todo' || campo === 'saberes';
  const coinciden = buscaSaberes ? ListaActividades.saberesQueCoinciden(actividad, texto, etapa) : [];
  const lista = coinciden.length
    ? `<ul class="lista-saberes">${coinciden.map((saber) => `<li>${escaparHtml(partirSaber(saber).texto)}</li>`).join('')}</ul>`
    : '';
  return areas + lista;
}

function pintar() {
  const texto = campoBusqueda.value;
  const campo = campoBuscarEn.value;
  const etapa = campoEtapa.value || null;
  const mes = Number(campoMes.value) || null;
  const encontradas = orden.ordenar(lista.buscar(texto, campo, etapa, mes));

  cuerpo.innerHTML = encontradas.map((a) => `
    <tr class="fila-enlace">
      <td>${escaparHtml(a.recurso)}</td>
      <td><a href="${direccionFicha(a, etapa)}">${escaparHtml(a.titulo)}</a></td>
      <td>${celdaSaberes(a, texto, campo, etapa)}</td>
      <td>${a.nombresEtapas.map((e) => `<span class="etiqueta">${escaparHtml(e)}</span>`).join(' ')}</td>
      <td>${calendarioHtml(a.meses)}</td>
    </tr>`).join('');

  if (encontradas.length === 0) {
    const aviso = lista.total === 0 ? 'Todavía no hay ninguna actividad.' : 'No hay ninguna actividad con esa búsqueda.';
    cuerpo.innerHTML = `<tr><td colspan="5" class="vacio">${aviso}</td></tr>`;
  }
  resultado.textContent = texto.trim() || etapa || mes
    ? `${encontradas.length} de ${lista.total} actividades`
    : `${lista.total} actividades`;

  guardarEnDireccion(texto, campo, etapa, mes);
}

function guardarEnDireccion(texto, campo, etapa, mes) {
  const parametros = new URLSearchParams();
  if (texto.trim()) parametros.set('q', texto.trim());
  if (campo !== 'todo') parametros.set('en', campo);
  if (etapa) parametros.set('etapa', etapa);
  if (mes) parametros.set('mes', mes);
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
  const mes = Number(parametros.get('mes'));
  if (mes >= 1 && mes <= 12) {
    campoMes.value = String(mes);
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
campoMes.addEventListener('change', pintar);

try {
  lista = await ListaActividades.cargar(BaseDatos.preparar());
  leerDeDireccion();
  pintar();
} catch (error) {
  console.error(error);
  resultado.textContent = 'No se han podido cargar las actividades.';
}
