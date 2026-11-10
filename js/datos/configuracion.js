/*
 * configuracion.js
 * ----------------
 * De dónde lee los datos la aplicación. Es lo único que hay que cambiar
 * para pasar de un modo a otro:
 *
 *   'firebase' → los datos están en Firestore (proyecto «huerto-escolar-66b3d»)
 *                y el profesorado entra con su cuenta de Firebase
 *                Authentication (correo y contraseña, creada en la consola).
 *   'local'    → los datos se leen de datos/*.json (4 actividades de ejemplo)
 *                y se entra con el usuario fijo admin / admin. Los cambios
 *                solo duran lo que la pestaña. Sirve para probar sin tocar
 *                los datos reales.
 */

export const ALMACEN = 'firebase';
