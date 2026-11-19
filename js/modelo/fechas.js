/*
 * fechas.js
 * ---------
 * Fechas de las sesiones de los itinerarios. Se guardan como texto
 * «AAAA-MM-DD» (el formato de <input type="date">), sin hora, para que
 * no cambien de día por la zona horaria.
 */

const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** Date (a las 0:00 de aquí) de un texto «AAAA-MM-DD». */
export function leerFecha(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Texto «AAAA-MM-DD» de un Date. */
export function textoFecha(fecha) {
  const dos = (numero) => String(numero).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** La fecha (texto) tantos días después (o antes, si es negativo). */
export function sumarDias(texto, dias) {
  const fecha = leerFecha(texto);
  fecha.setDate(fecha.getDate() + dias);
  return textoFecha(fecha);
}

/** «mar 14»: día de la semana y del mes. */
export function fechaCorta(texto) {
  const fecha = leerFecha(texto);
  return `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()}`;
}

/** «oct»: el mes abreviado. */
export function mesCorto(texto) {
  return leerFecha(texto).toLocaleDateString('es-ES', { month: 'short' });
}

/** «14 oct 2026». */
export function fechaMedia(texto) {
  return leerFecha(texto).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** «martes, 14 de octubre de 2026». */
export function fechaLarga(texto) {
  return leerFecha(texto).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** «Octubre 2026»: el mes de una fecha, para agrupar. */
export function mesDe(texto) {
  const nombre = leerFecha(texto).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1).replace(' de ', ' ');
}

/**
 * El curso escolar de una fecha: de septiembre a agosto.
 * 14 de octubre de 2026 → «2026-27»; 3 de marzo de 2027 → «2026-27».
 */
export function cursoDe(texto) {
  const fecha = leerFecha(texto);
  const inicio = fecha.getMonth() >= 8 ? fecha.getFullYear() : fecha.getFullYear() - 1;
  return `${inicio}-${String(inicio + 1).slice(2)}`;
}

/** Año en que empieza un curso: «2026-27» → 2026. */
export function inicioCurso(curso) {
  return Number(curso.slice(0, 4));
}

/**
 * Las fechas entre «desde» y «hasta» (incluidas) que caen en los días de la
 * semana elegidos (0 = domingo, 1 = lunes… como Date.getDay()).
 * Para crear las sesiones periódicas: «todos los martes de octubre».
 */
export function fechasPeriodicas(desde, hasta, diasSemana) {
  const fechas = [];
  for (let fecha = desde; fecha <= hasta; fecha = sumarDias(fecha, 1)) {
    if (diasSemana.includes(leerFecha(fecha).getDay())) {
      fechas.push(fecha);
    }
  }
  return fechas;
}
