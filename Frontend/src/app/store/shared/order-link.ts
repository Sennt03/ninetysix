import { STORE_WHATSAPP_NUMBER } from './store.config';

/**
 * Codec del enlace de pedido. El token adjunto al mensaje de WhatsApp ahora es
 * **compacto**: solo lleva referencias (slug del producto, id de variante y
 * cantidad) codificadas en base64url. Los datos reales (nombre, precio e imagen)
 * se resuelven en la página `/orden` desde el catálogo.
 *
 * Antes el token embebía nombre + opciones + precio de cada producto, lo que
 * hacía el enlace muy largo (WhatsApp lo cortaba/rompía) y sin imagen (la orden
 * mostraba solo iniciales). Con referencias el enlace es corto y la página puede
 * mostrar la imagen real del catálogo.
 */

export interface OrderOption {
  type: string;
  value: string;
}

/** Referencia compacta de una línea del pedido (lo que viaja en el enlace). */
export interface OrderRef {
  slug: string;
  variantId: string;
  qty: number;
}

/** Ítem con los datos de texto para el mensaje de WhatsApp. */
export interface OrderTextItem {
  name: string;
  options: OrderOption[];
  qty: number;
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

/** Serializa las referencias del pedido en una cadena base64url para la URL. */
export function encodeOrder(items: OrderRef[]): string {
  const compact = items.map((i) => [i.slug, i.variantId, i.qty]);
  return bytesToB64url(new TextEncoder().encode(JSON.stringify(compact)));
}

/** Reconstruye las referencias desde la cadena de la URL. `null` si es inválida. */
export function decodeOrder(raw: string | null | undefined): OrderRef[] | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(new TextDecoder().decode(b64urlToBytes(raw))) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    const items: OrderRef[] = [];
    for (const row of parsed) {
      if (!Array.isArray(row) || row.length < 3) {
        continue;
      }
      const [slug, variantId, qty] = row as [unknown, unknown, unknown];
      const n = Number(qty);
      if (
        typeof slug !== 'string' ||
        typeof variantId !== 'string' ||
        !Number.isFinite(n) ||
        n <= 0
      ) {
        continue;
      }
      items.push({ slug, variantId, qty: Math.floor(n) });
    }
    return items.length ? items : null;
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
export function orderWhatsappUrl(items: OrderTextItem[], orderUrl: string): string {
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
