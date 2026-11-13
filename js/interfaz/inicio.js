/*
 * inicio.js
 * ---------
 * Página de inicio (index.html): explica cómo usar la web y da accesos
 * rápidos a la tabla de actividades (todas, las de esta estación y por
 * categoría), con cuántas hay de cada.
 */

import { BaseDatos } from '../datos/BaseDatos.js';
import { ListaActividades } from '../modelo/ListaActividades.js';
import { CATEGORIAS } from '../modelo/categorias.js';
import { estacionDe } from '../modelo/estaciones.js';
import { Barra } from './Barra.js';
import { categoriaHtml } from './categoriaHtml.js';

const usuario = await Barra.pintar();

const estacion = estacionDe();
document.getElementById('enlaceEstacion').href = `actividades.html?estacion=${encodeURIComponent(estacion)}`;
document.getElementById('textoEstacion').textContent = `Para esta estación (${estacion.toLowerCase()})`;

try {
  // Las cuentas son de las publicadas, que son las que ve todo el mundo
  const lista = await ListaActividades.cargar(BaseDatos.preparar(), !usuario);
  const publicadas = lista.actividades.filter((a) => a.estaPublicada);

  document.getElementById('numeroTotal').textContent = publicadas.length;
  document.getElementById('numeroEstacion').textContent = publicadas.filter((a) => a.esDeEstacion(estacion)).length;

  document.getElementById('categorias').innerHTML = CATEGORIAS.map((categoria) => {
    const cuantas = publicadas.filter((a) => a.categoria === categoria.id).length;
    return `<a class="leyenda-boton" href="actividades.html?categoria=${categoria.id}">${categoriaHtml(categoria.id)} <span class="cuantas">${cuantas}</span></a>`;
  }).join('');
} catch (error) {
  console.error(error);
}
