# Huerto escolar — instrucciones para agentes

## Contexto privado
Antes de empezar cualquier tarea: si no existe ../notes-abelluco, clona el repositorio privado
notes-abelluco junto a este; haz git pull y lee normes-comunes.md y projectes/hort-escolar.md.
Cada vez que acabes una tarea: si se han tomado decisiones relevantes, actualiza projectes/hort-escolar.md,
este AGENTS.md y DECISIONS.md, y haz commit y push de los dos repositorios.

## Qué es
Web para que el profesorado del colegio busque y organice las actividades del huerto escolar, con los saberes básicos
del currículo de Aragón por etapa y un sistema de revisión. **El detalle (datos, permisos y páginas) está en CLAUDE.md:
léelo antes de tocar nada.**

## Estructura
- Una página HTML por pantalla (`index.html`, `actividades.html`, `actividad.html`, `acceso.html`, `editar.html`, `importar.html`)
- `js/datos/` (`BaseDatos` es la única puerta al almacenamiento; `ALMACEN` en `configuracion.js`: `'firebase'` o `'local'`),
  `js/modelo/`, `js/interfaz/`, `css/`
- `firestore.rules` (se copian a mano a la consola), `datos/` (ejemplos para el modo local), `propuestas/` (borradores JSON)

## Normas
- Código sencillo, legible y hecho "a mano". Sin frameworks, sin npm, sin bundler. Sin dependencias nuevas sin preguntar.
- Todo en **castellano**: código, interfaz y documentación interna (AGENTS.md, DECISIONS.md, LEEME.md).
- Si cambia `firestore.rules`, cambiar también `js/modelo/permisos.js` (y al revés).
- Web pública pero no indexada: cada página nueva lleva `<meta name="robots" content="noindex, nofollow">` y `<script src="js/registrarServiceWorker.js" defer></script>`.
- No toques ficheros fuera de los que pide la tarea.
- Nunca escribas claves, contraseñas ni tokens en ningún fichero.
- Ningún cambio se fusiona a main sin el OK de Mario.

## Ejecutar y probar
```
python -m http.server 8000
```
Modo local (`ALMACEN = 'local'`): usuarios de prueba `admin` (revisor) y `profe`. Sin pruebas automáticas.

## Delegar y auditar
Sigue las secciones "Delegar a Codex" y "Auditoria creuada" de ../notes-abelluco/normes-comunes.md:
delega por iniciativa propia las subtareas aislables, anótalo en delegacions.md y pide auditoría
a Codex (solo lectura) antes de publicar o en cambios delicados (permisos, reglas de Firestore).

## Publicar
Cada push a `main` publica la web en GitHub Pages (https://labelluco.github.io/hortescolar/): no hagas push sin el OK de Mario.
