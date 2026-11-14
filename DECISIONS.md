# Decisiones técnicas

Una línea por decisión, la más reciente arriba: fecha — decisión — por qué.

- 2026-11-14 — Cada actividad nueva cita sus principales fuentes en la última nota («Fuentes: …») — que se pueda comprobar y ampliar lo que dice.
- 2026-11-14 — Aspecto de la web de L'Abelluco: paleta de su `nucli.css` (verde pino, fondo de piedra caliza, ocre en los enlaces), barra clara con la abeja, títulos en negrita y botones redondeados — que se reconozca como un proyecto de L'Abelluco. Los colores de las categorías no cambian (son aptos para daltonismo).
- 2026-11-14 — Código AGPL-3.0 y actividades CC BY-SA 4.0; pie con el logo de L'Abelluco y forma de citar en la ficha — libre, pero que las versiones modificadas sigan siendo libres y citen el origen (difusión de L'Abelluco).
- 2026-11-14 — `sw.js` devuelve los ficheros con `Cache-Control: no-cache` — con F5 Chrome reutilizaba módulos viejos de la memoria de la pestaña sin pasar por el service worker (con Ctrl+Mayús+R sí salían los nuevos).
- 2026-11-14 — Nueva categoría «Lengua y tradición» (`lengua`, marrón) — para actividades de lengua y saberes populares, como el refranero del huerto.
- 2026-11-13 — Service worker (`sw.js`) que hace revalidar siempre los ficheros de la web — GitHub Pages deja 10 min de caché y el navegador mezclaba versiones después de publicar (la ficha se quedaba en «Cargando…»).
- 2026-11-13 — Las direcciones web de los textos de la ficha se muestran como enlaces (`textoConEnlaces`) — para poder enlazar guías de referencia.
- 2026-11-13 — No se reproducen fotos de guías de terceros; se enlazan y se ponen fotos propias — no tienen licencia que lo permita.
- 2026-11-13 — Revisión por roles: revisores en `config/roles` (Firestore); el resto deja las actividades pendientes; correos solo con sesión — control de calidad y privacidad; lo imponen las reglas de Firestore.
- 2026-11-13 — Inicio con ayuda en `index.html` y tabla en `actividades.html` — explicar el uso sin saturar la tabla.
- 2026-11-12 — Una categoría principal por actividad, con color (paleta apta para daltonismo) — el color identifica la fila; con varias se mezclarían.
- 2026-11-12 — Época por estaciones, no por meses; el momento exacto va en la nota — más fácil de rellenar.
- 2026-11-10 — Saberes básicos literales del currículo de Aragón, por etapa/ciclo, con área y bloque delante — fidelidad al currículo y búsqueda por área.
- 2026-11-10 — Imágenes reducidas en el navegador y guardadas en Firestore (sin Storage) — mantener el plan gratuito Spark sin tarjeta.
