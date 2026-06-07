import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { formatPrice } from '../../store/shared/price.pipe';

const CART_KEY = 'ninetysix_cart';
/** Número de WhatsApp de la tienda para finalizar el pedido. */
const WHATSAPP_NUMBER = '51987654321';

export interface CartItem {
  /** Clave única de la línea (id de variante). */
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Precio unitario de la variante. */
  price: number;
  /** Opciones de la variante (Color, Talla, …) para mostrar bajo el nombre. */
  options: { type: string; value: string }[];
  qty: number;
}

/**
 * Carrito de la tienda. Mantiene las líneas en memoria (signals) y las persiste
 * en localStorage. El pedido se finaliza por WhatsApp (no hay checkout online),
 * por eso el total relevante es la cantidad de productos.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly itemsState = signal<CartItem[]>(this.restore());
  readonly items = this.itemsState.asReadonly();

  /** Drawer abierto/cerrado. */
  private readonly openState = signal(false);
  readonly isOpen = this.openState.asReadonly();

  /** Total de unidades (suma de cantidades). */
  readonly count = computed(() => this.itemsState().reduce((n, i) => n + i.qty, 0));
  readonly hasItems = computed(() => this.itemsState().length > 0);

  /** Total en dinero (suma de precio × cantidad). */
  readonly total = computed(() =>
    this.itemsState().reduce((sum, i) => sum + i.price * i.qty, 0),
  );

  /** Enlace de WhatsApp con el pedido prellenado (incluye precios y total). */
  readonly whatsappUrl = computed(() => {
    const lines = this.itemsState().map((i) => {
      const opts = i.options.map((o) => `${o.type}: ${o.value}`).join(', ');
      return `• ${i.name}${opts ? ` (${opts})` : ''} x${i.qty} — ${formatPrice(i.price * i.qty)}`;
    });
    const msg = `Hola Ninetysix, quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(this.total())} (${this.count()} ${this.count() === 1 ? 'producto' : 'productos'})`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  });

  /** Añade una línea (o suma cantidad si la variante ya está) y abre el drawer. */
  add(item: Omit<CartItem, 'qty'>, qty = 1): void {
    this.itemsState.update((items) => {
      const existing = items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return items.map((i) => (i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...items, { ...item, qty }];
    });
    this.persist();
    this.open();
  }

  inc(variantId: string): void {
    this.itemsState.update((items) =>
      items.map((i) => (i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i)),
    );
    this.persist();
  }

  dec(variantId: string): void {
    this.itemsState.update((items) =>
      items
        .map((i) => (i.variantId === variantId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
    this.persist();
  }

  remove(variantId: string): void {
    this.itemsState.update((items) => items.filter((i) => i.variantId !== variantId));
    this.persist();
  }

  clear(): void {
    this.itemsState.set([]);
    this.persist();
  }

  open(): void {
    this.openState.set(true);
  }
  close(): void {
    this.openState.set(false);
  }
  toggle(): void {
    this.openState.update((v) => !v);
  }

  // ----------------------------- persistencia -----------------------------

  private restore(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Sanea líneas antiguas (p. ej. guardadas sin `price`) para evitar NaN.
      return parsed
        .filter((i) => i && i.variantId)
        .map((i) => ({
          ...i,
          price: typeof i.price === 'number' ? i.price : 0,
          qty: typeof i.qty === 'number' && i.qty > 0 ? i.qty : 1,
          options: Array.isArray(i.options) ? i.options : [],
        }));
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this.itemsState()));
    } catch {
      /* almacenamiento no disponible: se ignora. */
    }
  }
}
