import { STORE_WHATSAPP_NUMBER } from './store.config';

/**
 * Codificación del pedido en un enlace compacto y ofuscado (base64url).
 *
 * El enlace es el **valor real** del pedido: lleva embebidos los productos,
 * variantes, cantidades y precios. A diferencia del texto del mensaje de
 * WhatsApp (editable por el cliente), este enlace no se manipula casualmente y
 * al abrirlo reconstruye la pantalla de orden con el detalle y el total reales.
 *
 * Es autocontenido: no depende de la API ni de registrar órdenes; basta con los
 * datos serializados en la URL para pintar la página.
 */

export interface OrderOption {
  type: string;
  value: string;
}

/** Una línea del pedido (producto + variante elegida). */
export interface OrderItem {
  name: string;
  slug: string;
  options: OrderOption[];
  /** Precio unitario de la variante. */
  price: number;
  qty: number;
}

/** Pedido decodificado, con totales ya calculados. */
export interface DecodedOrder {
  items: OrderItem[];
  /** Suma de precio × cantidad. */
  subtotal: number;
  /** Total de unidades. */
  count: number;
}

/** Payload serializado (claves cortas para mantener el enlace breve). */
interface OrderPayload {
  v: 1;
  i: { n: string; s: string; o: [string, string][]; p: number; q: number }[];
}

// --------------------------- base64url (UTF-8) ---------------------------

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(raw: string): Uint8Array {
  const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

// ------------------------------- encode/decode -------------------------------

/** Serializa las líneas del pedido en una cadena base64url para la URL. */
export function encodeOrder(items: OrderItem[]): string {
  const payload: OrderPayload = {
    v: 1,
    i: items.map((it) => ({
      n: it.name,
      s: it.slug,
      o: it.options.map((o) => [o.type, o.value] as [string, string]),
      p: it.price,
      q: it.qty,
    })),
  };
  return bytesToB64url(new TextEncoder().encode(JSON.stringify(payload)));
}

/** Reconstruye el pedido desde la cadena de la URL. `null` si es inválida. */
export function decodeOrder(raw: string | null | undefined): DecodedOrder | null {
  if (!raw) {
    return null;
  }
  try {
    const json = new TextDecoder().decode(b64urlToBytes(raw));
    const payload = JSON.parse(json) as OrderPayload;
    if (!payload || payload.v !== 1 || !Array.isArray(payload.i)) {
      return null;
    }
    const items: OrderItem[] = payload.i
      .filter((l) => l && typeof l.n === 'string')
      .map((l) => ({
        name: l.n,
        slug: typeof l.s === 'string' ? l.s : '',
        options: Array.isArray(l.o)
          ? l.o.filter((o) => Array.isArray(o)).map(([type, value]) => ({ type, value }))
          : [],
        price: typeof l.p === 'number' && l.p >= 0 ? l.p : 0,
        qty: typeof l.q === 'number' && l.q > 0 ? Math.floor(l.q) : 1,
      }));
    if (!items.length) {
      return null;
    }
    return {
      items,
      subtotal: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: items.reduce((n, i) => n + i.qty, 0),
    };
  } catch {
    return null;
  }
}

// ------------------------------- WhatsApp -------------------------------

/**
 * Enlace de WhatsApp con el pedido prellenado. El mensaje lista **solo** los
 * productos a comprar (sin precios) y adjunta el enlace al detalle, que sí
 * contiene precios y total reales del pedido.
 */
export function orderWhatsappUrl(
  items: Pick<OrderItem, 'name' | 'options' | 'qty'>[],
  orderUrl: string,
): string {
  const lines = items.map((i) => {
    const opts = i.options.map((o) => `${o.type}: ${o.value}`).join(', ');
    return `• ${i.name}${opts ? ` (${opts})` : ''} ×${i.qty}`;
  });
  const msg =
    `Hola Ninetysix 👋 Quiero hacer este pedido:\n\n` +
    `${lines.join('\n')}\n\n` +
    `🧾 Detalle, cantidades y total del pedido:\n${orderUrl}`;
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
