/*
 * Barra
 * -----
 * Enlaces de la barra superior, comunes a todas las páginas. Cada página
 * tiene en su HTML un <nav id="barraEnlaces"></nav> y llama a Barra.pintar().
 *
 *   sin sesión → «Acceso profesorado»
 *   con sesión → «Nueva actividad» · correo · «Salir»
 *
 * Devuelve el usuario (o null) para que la página no tenga que volver a
 * preguntarlo (por ejemplo, para mostrar el botón «Editar»).
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
      nav.innerHTML = '<a href="acceso.html">Acceso profesorado</a>';
      return null;
    }

    nav.innerHTML = `
      <a href="editar.html">+ Nueva actividad</a>
      <span class="barra-usuario">${escaparHtml(usuario.correo)}</span>
      <button type="button" id="botonSalir">Salir</button>`;
    document.getElementById('botonSalir').addEventListener('click', async () => {
      await Sesion.salir();
      location.href = 'index.html';
    });
    return usuario;
  }
}
