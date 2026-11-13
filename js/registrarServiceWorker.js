/*
 * registrarServiceWorker.js
 * -------------------------
 * Activa sw.js (ver allí para qué sirve). Se carga en todas las páginas con
 * <script src="js/registrarServiceWorker.js" defer></script>.
 * Es un script normal, no un módulo, para que funcione aunque fallen los demás.
 */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((error) => console.error(error));
}
