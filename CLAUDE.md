# Huerto escolar — Actividades para el profesorado

Web para que el profesorado del colegio (unas 6 personas) organice actividades del huerto escolar buscándolas en una tabla. Unas 100 actividades como mucho, cada una con hasta 10 imágenes.

## Normas del proyecto

- **Idioma:** código e interfaz en **castellano** (clases, métodos, variables, comentarios, textos).
- **Tecnología:** HTML + CSS + JavaScript puro (módulos ES). Sin frameworks, sin bundler, sin npm.
- **Estilo:** código sencillo y legible, hecho "a mano". Cada clase en su fichero, con comentario de cabecera.
- **Publicación:** GitHub Pages, pública pero **no indexada** (`robots.txt` + `<meta name="robots" content="noindex, nofollow">` en cada página).
- **Ejecutar en local:** servidor estático (`python -m http.server 8000`), ver `LEEME.md`.

## Datos

- `ALMACEN` en `js/datos/configuracion.js`: `'local'` (lee `datos/*.json`) o `'firebase'` (Firestore; `configFirebase.js` aún sin rellenar).
- `BaseDatos` es la única puerta al almacenamiento: `leerColeccion`, `leerDocumento`, `direccionImagen`. Crear/modificar/borrar, previsto para más adelante.
- Colección `actividades`. Campos en `js/modelo/Actividad.js`.
- Las imágenes van en `datos/imagenes/{idActividad}/` (reducidas, máx. 1280 px) hasta decidir si se pasan a Firebase Storage.

## Páginas

1. `index.html`: tabla Recurso · Actividad · Saberes básicos · Etapa, con buscador (todas las columnas o una) y orden por columnas. La búsqueda queda en la dirección (`?q=…&en=…`).
2. `actividad.html?id=…`: ficha de la actividad con galería.
