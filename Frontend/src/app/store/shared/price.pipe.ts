import { Pipe, PipeTransform } from '@angular/core';

/** Moneda de la tienda. */
export const CURRENCY = 'S/';

/** Formatea un monto como `S/ 1,299.00`. Devuelve '' si es null/undefined. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) {
    return '';
  }
  const amount = value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY} ${amount}`;
}

/** Pipe puro para mostrar precios en las plantillas: `{{ price | price }}`. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPrice(value);
  }
}
