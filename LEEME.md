# Huerto escolar

Aplicación web para que el profesorado busque y consulte actividades ligadas al huerto escolar.

- **Portada** (`index.html`): tabla con las columnas *Recurso*, *Actividad*, *Saberes básicos* y *Etapa*. Se puede buscar en todas las columnas o solo en una (selector «en»), y ordenar haciendo clic en la cabecera. Al pulsar una fila se abre la ficha de la actividad.
- **Ficha** (`actividad.html?id=…`): todos los detalles de la actividad e imágenes (se amplían al hacer clic).

HTML + CSS + JavaScript puro (módulos ES), sin frameworks ni paso de compilación. La web no se indexa (`robots.txt` y `noindex`).

## Arrancar en local

Los módulos ES y `fetch()` no funcionan abriendo el fichero con doble clic (`file://`); hace falta un servidor estático. En esta carpeta:

```
python -m http.server 8000
```

y abrir http://localhost:8000. También sirve la extensión Live Server de VS Code.

## Datos

`js/datos/configuracion.js` decide de dónde se leen:

- `'local'`: de `datos/actividades.json` (ahora mismo, con 4 actividades **de ejemplo**).
- `'firebase'`: de la colección `actividades` de Firestore (hay que rellenar antes `js/datos/configFirebase.js`).

Cada actividad tiene: `id`, `recurso`, `titulo`, `saberes[]`, `etapa`, `descripcion`, `objetivos[]`, `materiales[]`, `desarrollo[]` (pasos), `duracion`, `epoca` e `imagenes[]` (máx. 10, cada una `{ ruta, texto }`, con la ruta relativa a `datos/`).
