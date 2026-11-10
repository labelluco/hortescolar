# Huerto escolar — Actividades para el profesorado

Web para que el profesorado del colegio (unas 6 personas) organice actividades del huerto escolar buscándolas en una tabla. Unas 100 actividades como mucho, cada una con hasta 10 imágenes.

## Normas del proyecto

- **Idioma:** código e interfaz en **castellano** (clases, métodos, variables, comentarios, textos).
- **Tecnología:** HTML + CSS + JavaScript puro (módulos ES). Sin frameworks, sin bundler, sin npm.
- **Estilo:** código sencillo y legible, hecho "a mano". Cada clase en su fichero, con comentario de cabecera.
- **Publicación:** GitHub Pages, pública pero **no indexada** (`robots.txt` + `<meta name="robots" content="noindex, nofollow">` en cada página).
- **Ejecutar en local:** servidor estático (`python -m http.server 8000`), ver `LEEME.md`.

## Datos

- `ALMACEN` en `js/datos/configuracion.js`: `'firebase'` (Firestore del proyecto `huerto-escolar-66b3d`, `europe-southwest1`, plan Spark) o `'local'` (lee `datos/*.json`, usuario `admin`/`admin`, cambios en `sessionStorage`).
- `BaseDatos` es la única puerta al almacenamiento: `leerColeccion`, `leerDocumento`, `aplicarCambios` (lote de guardar/borrar, todo o nada), `nuevoId`, `direccionImagen`.
- **Etapas:** `ETAPAS` en `js/modelo/Actividad.js` (Infantil y los tres ciclos de Primaria). Cada actividad tiene `etapas[]` con `{ etapa, saberes[], adaptacion }`. Los saberes básicos se copian **literalmente** del currículo de Aragón, precedidos del área y el bloque: «Ciencias de la Naturaleza (A.2): …». Infantil: Orden ECD/853/2022 (BOA 17/06/2022). Primaria: anexos de la Orden ECD/1112/2022 en educa.aragon.es (en Aragón, Conocimiento del Medio está dividido en Ciencias de la Naturaleza y Ciencias Sociales).
- **Época:** `meses[]` (1–12) en que se puede hacer; se muestran de septiembre a agosto (`js/modelo/calendario.js`, `js/interfaz/calendarioHtml.js`). `epoca` queda como nota libre.
- **Tabla de la portada:** columna de saberes con solo las áreas (`js/modelo/saber.js` separa «Área (bloque): texto»); con búsqueda, debajo los saberes que coinciden. Columna y filtro de época.
- **Borradores de actividades** en `propuestas/*.json` (mismo formato que la colección, con `id`); se suben con `importar.html`.
- Colecciones: `actividades` (campos en `js/modelo/Actividad.js`) e `imagenes` (`{ actividadId, datos }`, imagen reducida a 1280 px como data URL, < 1 MB). **Sin Firebase Storage**, para no necesitar el plan Blaze.
- Seguridad (`firestore.rules`, se copian a mano a la consola): leer, cualquiera; escribir, con sesión. Cuentas del profesorado creadas en la consola; registro libre desactivado.
- `Sesion` (Firebase Authentication o usuario fijo en local); `Sesion.proteger()` en las páginas de edición.

## Páginas

1. `index.html`: tabla Recurso · Actividad · Saberes básicos · Etapa, con buscador (todas las columnas o una) y orden por columnas. La búsqueda queda en la dirección (`?q=…&en=…`).
2. `actividad.html?id=…`: ficha de la actividad con galería; botón «Editar» con sesión.
3. `acceso.html`: acceso del profesorado (`?volver=` para regresar).
4. `editar.html` / `editar.html?id=…`: crear, modificar y borrar, con un bloque por etapa (saberes y adaptación) y editor de imágenes (máx. 10, ordenar, pie de foto).
5. `importar.html`: subir actividades desde ficheros JSON (sustituye por id y conserva las imágenes).
