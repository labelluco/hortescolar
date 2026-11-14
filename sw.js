/*
 * sw.js — service worker
 * ----------------------
 * Para qué sirve: GitHub Pages deja que el navegador guarde cada fichero
 * hasta 10 minutos sin volver a pedirlo. Justo después de publicar un
 * cambio, el navegador podía mezclar ficheros nuevos y viejos, y una página
 * se quedaba en «Cargando…».
 *
 * Este service worker hace que, para los ficheros de esta web, el navegador
 * pregunte siempre al servidor si hay una versión nueva antes de usar la que
 * tiene guardada. Si no ha cambiado, el servidor contesta «igual que antes»
 * y es casi instantáneo.
 *
 * Solo afecta a los ficheros de esta misma web: Firebase y el resto de
 * direcciones externas funcionan como siempre. No guarda nada para usar sin
 * conexión.
 *
 * Lo registra js/registrarServiceWorker.js en cada página.
 */

// Que la versión nueva del service worker empiece a funcionar enseguida
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  const esDeEstaWeb = new URL(peticion.url).origin === self.location.origin;
  if (peticion.method !== 'GET' || !esDeEstaWeb) {
    return; // el navegador lo hace como siempre
  }
  evento.respondWith(
    // «no-cache»: usa lo guardado solo si el servidor confirma que no ha cambiado
    fetch(peticion.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then((respuesta) => (peticion.mode === 'navigate' ? respuesta : sinGuardarEnMemoria(respuesta)))
      // Sin conexión: lo que tenga guardado el navegador, como sin service worker
      .catch(() => fetch(peticion)),
  );
});

/*
 * Al recargar con F5 en la misma pestaña, Chrome reutilizaba los módulos JS
 * que tenía en la memoria de la página sin pasar por aquí, y se veía la
 * versión vieja. Devolvemos la misma respuesta con «Cache-Control: no-cache»
 * para que el navegador tenga que volver a pedírnosla cada vez.
 * (Las páginas HTML no se tocan: pueden venir de una redirección y no hace falta.)
 */
function sinGuardarEnMemoria(respuesta) {
  if (respuesta.type !== 'basic' || respuesta.redirected) {
    return respuesta;
  }
  const cabeceras = new Headers(respuesta.headers);
  cabeceras.set('Cache-Control', 'no-cache');
  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras,
  });
}
