# Huerto escolar

Aplicación web para que el profesorado busque y consulte actividades ligadas al huerto escolar.

Publicada en GitHub Pages (rama `main`, carpeta raíz): https://labelluco.github.io/hortescolar/

- **Inicio** (`index.html`): explica cómo usar la web, con accesos rápidos (todas, las de esta estación y por categoría).
- **Actividades** (`actividades.html`): tabla con las columnas *Recurso*, *Actividad*, *Saberes básicos* y *Etapa*. Se puede buscar en todas las columnas o solo en una (selector «en»), y ordenar haciendo clic en la cabecera. Al pulsar una fila se abre la ficha de la actividad.
- **Ficha** (`actividad.html?id=…`): todos los detalles de la actividad e imágenes (se amplían al hacer clic).
- **Acceso profesorado** (`acceso.html`) y **edición** (`editar.html`, `editar.html?id=…`): con sesión iniciada se pueden crear, modificar y borrar actividades y subir hasta 10 imágenes por actividad. Consultar no necesita sesión.
- **Importar** (`importar.html`): con sesión, sube de una vez actividades preparadas en ficheros JSON (los borradores están en `propuestas/`). Si la actividad ya existe, se sustituye conservando sus imágenes.

Cada actividad tiene una **categoría** principal (Cultivo, Experimentación, Naturaleza y biodiversidad, Sostenibilidad, Arte y creatividad, Alimentación y cocina), con un color que se ve en la tabla. La leyenda de colores de la tabla también filtra. Para añadir categorías: `js/modelo/categorias.js` y su color `--cat-{id}` en `css/estilos.css`.

Cada actividad puede servir para varias etapas (Infantil y los tres ciclos de Primaria). En cada etapa tiene sus **saberes básicos**, copiados literalmente del currículo de Aragón (Orden ECD/853/2022 de Infantil y anexos de la Orden ECD/1112/2022 de Primaria), y una **adaptación**. En la tabla se puede filtrar por etapa y por época (estación). Para no saturar la tabla, la columna de saberes muestra solo las áreas; si se busca un texto, aparecen debajo los saberes que coinciden. Los saberes completos están en la ficha.

HTML + CSS + JavaScript puro (módulos ES), sin frameworks ni paso de compilación. La web no se indexa (`robots.txt` y `noindex`).

## Arrancar en local

Los módulos ES y `fetch()` no funcionan abriendo el fichero con doble clic (`file://`); hace falta un servidor estático. En esta carpeta:

```
python -m http.server 8000
```

y abrir http://localhost:8000. También sirve la extensión Live Server de VS Code.

## Datos

`js/datos/configuracion.js` decide de dónde se leen:

- `'firebase'` (el normal): Firestore del proyecto `huerto-escolar-66b3d` (Madrid, plan gratuito Spark).
- `'local'`: `datos/actividades.json` (4 actividades **de ejemplo**) y usuario `admin` / `admin`. Los cambios solo duran lo que la pestaña; sirve para probar sin tocar los datos reales.

Colecciones de Firestore:

- `actividades`: `recurso`, `titulo`, `categoria` (id de `js/modelo/categorias.js`), `etapas[]` (cada una `{ etapa, saberes[], adaptacion }`, con `etapa` = `Infantil`, `Primaria · 1.er ciclo`, `Primaria · 2.º ciclo` o `Primaria · 3.er ciclo`), `descripcion`, `objetivos[]`, `materiales[]`, `desarrollo[]` (pasos), `notas[]` (notas y precauciones), `duracion`, `estaciones[]` (`Otoño`, `Invierno`, `Primavera`, `Verano`: cuándo se puede hacer), `epoca` (nota libre con el momento exacto, por ejemplo «sembrar en la luna menguante de diciembre»), `imagenes[]` (máx. 10, cada una `{ id, texto }`) y `modificada` (`{ por, el }`).
- `imagenes`: una por imagen, `{ actividadId, datos }`, con la imagen ya reducida en el navegador (máx. 1280 px, JPEG, menos de 1 MB) como texto `data:image/jpeg;base64,…`. Así no hace falta Firebase Storage ni el plan de pago.

## Profesorado y revisión

Hay dos tipos de cuenta:

- **Revisores**: publican directamente, aprueban las actividades pendientes y pueden editar o borrar cualquiera.
- **Resto del profesorado**: lo que crean (o importan) queda **pendiente de revisión**; lo ve el profesorado con sesión, pero no se publica hasta que un revisor lo aprueba. Pueden editar o borrar sus actividades mientras están pendientes.

Los revisores son los correos de la lista `revisores` del documento `config/roles` de Firestore (consola de Firebase → Firestore Database → `config` → `roles`). Para añadir o quitar un revisor, se edita esa lista. Cada actividad guarda quién la creó, modificó y revisó; solo se ve con sesión.


Las cuentas se crean en la consola de Firebase: **Authentication → Users → Add user** (correo y contraseña). El registro libre está desactivado. Para quitar el acceso a alguien, se borra o se desactiva su usuario ahí.

## Reglas de seguridad

`firestore.rules`: las actividades publicadas las lee cualquiera; las pendientes, solo el profesorado; quién puede escribir qué está explicado al principio del fichero y es lo mismo que `js/modelo/permisos.js`. Si se cambian, hay que copiarlas a mano en la consola (**Firestore Database → Reglas → Publicar**).

## Licencias

Un proyecto de [L'Abelluco](https://labelluco.github.io/abelluco/). Código: [AGPL-3.0](LICENSE). Actividades (textos y fotos): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es). Detalles y forma de citar en [LICENCIA-CONTENIDOS.md](LICENCIA-CONTENIDOS.md).
