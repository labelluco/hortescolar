/*
 * Barra
 * -----
 * Enlaces de la barra superior, comunes a todas las páginas. Cada página
 * tiene en su HTML un <nav id="barraEnlaces"></nav> y llama a Barra.pintar().
 *
 *   sin sesión → «Inicio» · «Actividades» · «Acceso profesorado»
 *   con sesión → «Inicio» · «Actividades ▾» · correo · «Salir»
 *                donde «Actividades» es un menú con: Ver actividades,
 *                + Nueva actividad, Importar y (si es revisor) Pendientes.
 *
 * El menú es un <details>: se abre y se cierra sin programar nada; solo se
 * añade que se cierre al pulsar fuera de él.
 *
 * Devuelve el usuario ({ correo, revisor } o null) para que la página no
 * tenga que volver a preguntarlo (por ejemplo, para mostrar el botón «Editar»).
 */

import { Sesion } from './Sesion.js';
import { escaparHtml } from './ayudas.js';

export class Barra {
  static async pintar() {
    const nav = document.getElementById('barraEnlaces');
    let usuario = null;
    try {
      usuario = await Sesion.usuario();
    } catch (error) {
      console.error(error);
    }

    if (!usuario) {
      nav.innerHTML = `
        <a href="index.html">Inicio</a>
        <a href="actividades.html">Actividades</a>
        <a href="acceso.html">Acceso profesorado</a>`;
      return null;
    }

    nav.innerHTML = `
      <a href="index.html">Inicio</a>
      <details class="menu" id="menuActividades">
        <summary>Actividades</summary>
        <div class="menu-opciones">
          <a href="actividades.html">Ver actividades</a>
          <a href="editar.html">+ Nueva actividad</a>
          <a href="importar.html">Importar</a>
          ${usuario.revisor ? '<a href="actividades.html?estado=pendiente">Pendientes de revisión</a>' : ''}
        </div>
      </details>
      <span class="barra-usuario">${escaparHtml(usuario.correo)}${usuario.revisor ? ' · revisor' : ''}</span>
      <button type="button" id="botonSalir">Salir</button>`;

    // El menú se cierra al pulsar fuera de él
    const menu = document.getElementById('menuActividades');
    document.addEventListener('click', (evento) => {
      if (!menu.contains(evento.target)) menu.open = false;
    });

    document.getElementById('botonSalir').addEventListener('click', async () => {
      await Sesion.salir();
      location.href = 'index.html';
    });
    return usuario;
  }
}
