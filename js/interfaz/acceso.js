/*
 * acceso.js
 * ---------
 * Página de acceso del profesorado (acceso.html). Al entrar, vuelve a la
 * página de la que venía (?volver=…) o a la portada.
 */

import { Sesion } from './Sesion.js';

const formulario = document.getElementById('formularioAcceso');
const textoError = document.getElementById('error');
const boton = document.getElementById('botonEntrar');

/** Solo se vuelve a páginas de esta misma web (nada de direcciones externas). */
function paginaDeVuelta() {
  const volver = new URLSearchParams(location.search).get('volver') ?? '';
  return /^[a-z]+\.html(\?.*)?$/.test(volver) ? volver : 'index.html';
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  textoError.textContent = '';
  boton.disabled = true;
  try {
    await Sesion.entrar(
      document.getElementById('correo').value.trim(),
      document.getElementById('contrasena').value,
    );
    location.href = paginaDeVuelta();
  } catch (error) {
    textoError.textContent = error.message;
    boton.disabled = false;
  }
});
