# Decisiones técnicas

Una línea por decisión, la más reciente arriba: fecha — decisión — por qué.

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
