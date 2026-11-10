/*
 * configuracion.js
 * ----------------
 * De dónde lee los datos la aplicación. Es lo único que hay que cambiar
 * para pasar de un modo a otro:
 *
 *   'local'    → los datos se leen de datos/*.json (ficheros de este mismo
 *                proyecto). Sirve para trabajar sin Firebase o con ejemplos.
 *   'firebase' → los datos están en Firestore. Antes hay que rellenar
 *                configFirebase.js con los datos del proyecto de Firebase.
 */

export const ALMACEN = 'local';
