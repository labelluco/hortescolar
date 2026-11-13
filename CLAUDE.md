@AGENTS.md

# Huerto escolar — Actividades para el profesorado

Web para que el profesorado del colegio (unas 6 personas) organice actividades del huerto escolar buscándolas en una tabla. Unas 100 actividades como mucho, cada una con hasta 10 imágenes.

## Normas del proyecto

- **Idioma:** código e interfaz en **castellano** (clases, métodos, variables, comentarios, textos).
- **Tecnología:** HTML + CSS + JavaScript puro (módulos ES). Sin frameworks, sin bundler, sin npm.
- **Estilo:** código sencillo y legible, hecho "a mano". Cada clase en su fichero, con comentario de cabecera.
- **Publicación:** GitHub Pages, pública pero **no indexada** (`robots.txt` + `<meta name="robots" content="noindex, nofollow">` en cada página).
- **Memoria caché:** `sw.js` (service worker, registrado por `js/registrarServiceWorker.js` en cada página) hace que el navegador pregunte siempre si hay versión nueva de los ficheros de la web, para que tras publicar no mezcle ficheros nuevos y viejos. Cada página nueva lleva `<script src="js/registrarServiceWorker.js" defer></script>`.
- **Ejecutar en local:** servidor estático (`python -m http.server 8000`), ver `LEEME.md`.

## Datos

- `ALMACEN` en `js/datos/configuracion.js`: `'firebase'` (Firestore del proyecto `huerto-escolar-66b3d`, `europe-southwest1`, plan Spark) o `'local'` (lee `datos/*.json`, usuario `admin`/`admin`, cambios en `sessionStorage`).
- `BaseDatos` es la única puerta al almacenamiento: `leerColeccion`, `leerDocumento`, `aplicarCambios` (lote de guardar/borrar, todo o nada), `nuevoId`, `direccionImagen`.
- **Etapas:** `ETAPAS` en `js/modelo/Actividad.js` (Infantil y los tres ciclos de Primaria). Cada actividad tiene `etapas[]` con `{ etapa, saberes[], adaptacion }`. Los saberes básicos se copian **literalmente** del currículo de Aragón, precedidos del área y el bloque: «Ciencias de la Naturaleza (A.2): …». Infantil: Orden ECD/853/2022 (BOA 17/06/2022). Primaria: anexos de la Orden ECD/1112/2022 en educa.aragon.es (en Aragón, Conocimiento del Medio está dividido en Ciencias de la Naturaleza y Ciencias Sociales).
- **Categorías:** una principal por actividad (`categoria`, id de `js/modelo/categorias.js`); color en la variable `--cat-{id}` de `css/estilos.css` (paleta apta para daltonismo; el color va siempre con el nombre). Franja de color en la fila, etiqueta bajo el título y leyenda que filtra en la tabla. Se añaden categorías a medida que llegan actividades.
- **Época:** `estaciones[]` (Otoño, Invierno, Primavera, Verano, en orden de curso) en que se puede hacer (`js/modelo/estaciones.js`, `js/interfaz/estacionesHtml.js`). El momento exacto va en la nota `epoca` o en el desarrollo. Los documentos antiguos con `meses[]` se convierten al leerlos.
- **Tabla de actividades:** columna «Áreas / Saberes básicos» con solo las áreas (`js/modelo/saber.js` separa «Área (bloque): texto»); con búsqueda, debajo los saberes que coinciden, cada uno con su etapa o ciclo (en Aragón los saberes van por ciclo, no por curso). Columna y filtro de época.
- **Borradores de actividades** en `propuestas/*.json` (mismo formato que la colección, con `id`); se suben con `importar.html`.
- Colecciones: `actividades` (campos en `js/modelo/Actividad.js`) e `imagenes` (`{ actividadId, datos }`, imagen reducida a 1280 px como data URL, < 1 MB). **Sin Firebase Storage**, para no necesitar el plan Blaze.
- Seguridad (`firestore.rules`, se copian a mano a la consola): leer, cualquiera; escribir, con sesión. Cuentas del profesorado creadas en la consola; registro libre desactivado.
- `Sesion` (Firebase Authentication o usuario fijo en local); `Sesion.proteger()` en las páginas de edición.

## Revisión y autoría

- Dos roles: **revisores** (correos de la lista `revisores` del documento `config/roles` de Firestore, editable solo en la consola) y **resto del profesorado**. Sin sesión, solo se ven las publicadas.
- `estado` de cada actividad: `publicada` o `pendiente`. Lo que guarda o importa un revisor queda publicado; lo del resto, pendiente. El resto solo edita/borra sus propias pendientes; las publicadas, solo revisores.
- Autoría: `creada`, `modificada` y `revisada` (`{ por, el }`). Los correos solo se muestran con sesión.
- Las reglas de verdad están en `firestore.rules`; `js/modelo/permisos.js` dice lo mismo y solo decide qué botones se ven. Si cambia una, cambiar la otra.
- Sin sesión hay que leer las actividades con el filtro `estado == 'publicada'` (Firestore rechaza la consulta entera si podría devolver algo no permitido).
- Modo local: `admin`/`admin` (revisor) y `profe`/`profe` (normal).

## Páginas

1. `index.html`: inicio, con ayuda de uso y accesos rápidos (todas, esta estación, por categoría). Redirige los enlaces antiguos con búsqueda a `actividades.html`.
2. `actividades.html`: tabla Recurso · Actividad · Áreas/Saberes · Etapa · Época, con buscador, filtros (etapa, época, categoría y, con sesión, estado) y orden por columnas. La búsqueda queda en la dirección.
3. `actividad.html?id=…`: ficha con galería; con sesión, autoría, «Editar» (según permisos) y, si está pendiente, aviso y «Aprobar y publicar» para revisores.
4. `acceso.html`: acceso del profesorado (`?volver=` para regresar).
5. `editar.html` / `editar.html?id=…`: crear, modificar y borrar, con un bloque por etapa (saberes y adaptación), época, categoría y editor de imágenes (máx. 10, ordenar, pie de foto).
6. `importar.html`: subir actividades desde ficheros JSON (sustituye por id, conserva las imágenes y la autoría; el estado lo pone el rol de quien sube).
