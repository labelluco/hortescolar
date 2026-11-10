/*
 * portada.js
 * ----------
 * Página principal (index.html): tabla de actividades con buscador y
 * columnas ordenables. Al hacer clic en una fila se abre su ficha.
 *
 * La búsqueda se guarda en la dirección (?q=huellas&en=recurso), así que al
 * volver atrás desde una ficha se conserva, y se puede compartir el enlace.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { OrdenTabla } from './OrdenTabla.js';
import { Barra } from './Barra.js';
import { escaparHtml } from './ayudas.js';

Barra.pintar();

const campoBusqueda = document.getElementById('busqueda');
const campoBuscarEn = document.getElementById('buscarEn');
const cuerpo = document.getElementById('filas');
const resultado = document.getElementById('resultado');

let lista = null;

const orden = new OrdenTabla(document.getElementById('tabla'), {
  recurso: (a) => a.recurso,
  titulo: (a) => a.titulo,
  saberes: (a) => a.saberesEnTexto,
  etapa: (a) => a.etapa,
}, pintar);

function pintar() {
  const texto = campoBusqueda.value;
  const campo = campoBuscarEn.value;
  const encontradas = orden.ordenar(lista.buscar(texto, campo));

  cuerpo.innerHTML = encontradas.map((a) => `
    <tr class="fila-enlace" data-id="${escaparHtml(a.id)}">
      <td>${escaparHtml(a.recurso)}</td>
      <td><a href="actividad.html?id=${encodeURIComponent(a.id)}">${escaparHtml(a.titulo)}</a></td>
      <td>${a.saberes.map((s) => `<span class="etiqueta">${escaparHtml(s)}</span>`).join(' ')}</td>
      <td>${escaparHtml(a.etapa)}</td>
    </tr>`).join('');

  if (encontradas.length === 0) {
    const aviso = lista.total === 0 ? 'Todavía no hay ninguna actividad.' : 'No hay ninguna actividad con esa búsqueda.';
    cuerpo.innerHTML = `<tr><td colspan="4" class="vacio">${aviso}</td></tr>`;
  }
  resultado.textContent = texto.trim()
    ? `${encontradas.length} de ${lista.total} actividades`
    : `${lista.total} actividades`;

  guardarEnDireccion(texto, campo);
}

function guardarEnDireccion(texto, campo) {
  const parametros = new URLSearchParams();
  if (texto.trim()) parametros.set('q', texto.trim());
  if (campo !== 'todo') parametros.set('en', campo);
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
}

// Toda la fila se puede pulsar, no solo el enlace del título.
cuerpo.addEventListener('click', (evento) => {
  const fila = evento.target.closest('tr[data-id]');
  if (fila && !evento.target.closest('a')) {
    location.href = `actividad.html?id=${encodeURIComponent(fila.dataset.id)}`;
  }
});

document.getElementById('buscador').addEventListener('submit', (evento) => evento.preventDefault());
campoBusqueda.addEventListener('input', pintar);
campoBuscarEn.addEventListener('change', pintar);

try {
  lista = await ListaActividades.cargar(BaseDatos.preparar());
  leerDeDireccion();
  pintar();
} catch (error) {
  console.error(error);
  resultado.textContent = 'No se han podido cargar las actividades.';
}
