/*
 * OrdenTabla
 * ----------
 * Permite ordenar una tabla haciendo clic en la cabecera de sus columnas.
 *
 * En el HTML, cada cabecera que se pueda ordenar lleva data-orden con el
 * nombre de la columna:   <th data-orden="recurso">Recurso</th>
 *
 * La página indica cómo sacar el valor de cada columna a partir de una fila
 * y qué hacer cuando cambia el orden (normalmente, volver a pintar):
 *
 *   const orden = new OrdenTabla(tabla, {
 *     recurso: (actividad) => actividad.recurso,
 *     etapa: (actividad) => actividad.etapa,
 *   }, pintar);
 *
 *   // dentro de pintar():
 *   const ordenados = orden.ordenar(encontrados);
 *
 * El primer clic ordena de menor a mayor (A → Z), el segundo al revés.
 * Mientras no se haga clic en ninguna, se respeta el orden de la lista.
 * Los textos se comparan en castellano (sin distinguir tildes ni mayúsculas)
 * y las celdas vacías van siempre al final.
 */

import { compararTextos } from '../modelo/texto.js';

export class OrdenTabla {
  constructor(tabla, columnas, alCambiar) {
    this.columnas = columnas;
    this.alCambiar = alCambiar;
    this.columna = null;
    this.ascendente = true;
    this.cabeceras = [...tabla.querySelectorAll('th[data-orden]')];

    // El texto de cada cabecera pasa a ser un botón (se puede usar con teclado)
    for (const cabecera of this.cabeceras) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'orden-boton';
      boton.innerHTML = `${cabecera.innerHTML}<span class="orden-flecha" aria-hidden="true"></span>`;
      boton.addEventListener('click', () => this.elegir(cabecera.dataset.orden));
      cabecera.replaceChildren(boton);
    }
  }

  /** Ordena por esa columna; si ya lo estaba, invierte el sentido. */
  elegir(columna) {
    if (this.columna === columna) {
      this.ascendente = !this.ascendente;
    } else {
      this.columna = columna;
      this.ascendente = true;
    }
    for (const cabecera of this.cabeceras) {
      if (cabecera.dataset.orden === this.columna) {
        cabecera.setAttribute('aria-sort', this.ascendente ? 'ascending' : 'descending');
      } else {
        cabecera.removeAttribute('aria-sort');
      }
    }
    this.alCambiar();
  }

  /** Devuelve una copia de la lista ordenada según la columna elegida. */
  ordenar(lista) {
    const valorDe = this.columnas[this.columna];
    if (!valorDe) {
      return lista;
    }
    const sentido = this.ascendente ? 1 : -1;
    return [...lista].sort((a, b) => {
      const valorA = valorDe(a);
      const valorB = valorDe(b);
      const vacioA = valorA === null || valorA === undefined || valorA === '';
      const vacioB = valorB === null || valorB === undefined || valorB === '';
      if (vacioA || vacioB) {
        return vacioA - vacioB; // las vacías, al final en los dos sentidos
      }
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return (valorA - valorB) * sentido;
      }
      return compararTextos(valorA, valorB) * sentido;
    });
  }
}
