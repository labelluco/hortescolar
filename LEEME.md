# Huerto escolar

Aplicación web para que el profesorado busque y consulte actividades ligadas al huerto escolar.

Publicada en GitHub Pages (rama `main`, carpeta raíz): https://labelluco.github.io/hortescolar/

- **Portada** (`index.html`): tabla con las columnas *Recurso*, *Actividad*, *Saberes básicos* y *Etapa*. Se puede buscar en todas las columnas o solo en una (selector «en»), y ordenar haciendo clic en la cabecera. Al pulsar una fila se abre la ficha de la actividad.
- **Ficha** (`actividad.html?id=…`): todos los detalles de la actividad e imágenes (se amplían al hacer clic).
- **Acceso profesorado** (`acceso.html`) y **edición** (`editar.html`, `editar.html?id=…`): con sesión iniciada se pueden crear, modificar y borrar actividades y subir hasta 10 imágenes por actividad. Consultar no necesita sesión.

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

- `actividades`: `recurso`, `titulo`, `saberes[]`, `etapa`, `descripcion`, `objetivos[]`, `materiales[]`, `desarrollo[]` (pasos), `duracion`, `epoca`, `imagenes[]` (máx. 10, cada una `{ id, texto }`) y `modificada` (`{ por, el }`).
- `imagenes`: una por imagen, `{ actividadId, datos }`, con la imagen ya reducida en el navegador (máx. 1280 px, JPEG, menos de 1 MB) como texto `data:image/jpeg;base64,…`. Así no hace falta Firebase Storage ni el plan de pago.

## Profesorado

Las cuentas se crean en la consola de Firebase: **Authentication → Users → Add user** (correo y contraseña). El registro libre está desactivado. Para quitar el acceso a alguien, se borra o se desactiva su usuario ahí.

## Reglas de seguridad

`firestore.rules`: leer, cualquiera; escribir, solo con sesión. Si se cambian, hay que copiarlas a mano en la consola (**Firestore Database → Reglas → Publicar**).
