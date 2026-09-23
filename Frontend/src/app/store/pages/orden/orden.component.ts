import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '@env/environment';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { map } from 'rxjs';
import { decodeOrder, orderWhatsappUrl } from '../../shared/order-link';
import { PricePipe } from '../../shared/price.pipe';

const SITE_ORIGIN = environment.url_site.replace(/\/+$/, '');

/** Línea del pedido ya resuelta contra el catálogo (precio e imagen reales). */
interface OrderLine {
  slug: string;
  name: string;
  image: string | null;
  options: { type: string; value: string }[];
  price: number;
  qty: number;
  subtotal: number;
}

/**
 * Página de orden (`/orden?o=<token>`). El token solo lleva **referencias**
 * (slug + variante + cantidad); aquí se resuelven contra el catálogo para pintar
 * el pedido con nombre, precio, imagen y total reales. No registra órdenes: se
 * reconstruye desde la URL. Antes el token embebía todos los datos (enlace muy
 * largo y sin imagen); ahora es corto y muestra la foto real del producto.
 */
@Component({
  selector: 'app-orden',
  imports: [RouterLink, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ord">
      <span class="ord__grid" aria-hidden="true"></span>
      <span class="ord__glow" aria-hidden="true"></span>

      @if (decoded() === null) {
        <div class="ord__inner ord__empty">
          <span class="ord__empty-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4H6z"
                stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M4 6h16M16 10a4 4 0 01-8 0"
                stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <h1 class="ord__title">Pedido no disponible</h1>
          <p class="ord__sub">
            El enlace del pedido no es válido o está incompleto. Arma tu pedido de nuevo
            desde el catálogo.
          </p>
          <a class="ord__keep ord__keep--solid" routerLink="/catalogo">Ir al catálogo</a>
        </div>
      } @else if (lines().length) {
        <div class="ord__inner">
          <header class="ord__head">
            <span class="ord__eyebrow">
              <span class="ord__dot" aria-hidden="true"></span>
              Pedido Ninetysix
            </span>
            <h1 class="ord__title">Resumen de tu pedido</h1>
            <p class="ord__sub">
              {{ count() }} {{ count() === 1 ? 'producto' : 'productos' }} ·
              este es el detalle real que enviaste por WhatsApp.
            </p>
          </header>

          <div class="ord__card">
            <ul class="ord__list">
              @for (item of lines(); track item.slug + $index) {
                <li class="ln">
                  @if (item.image) {
                    <a class="ln__img" [routerLink]="['/producto', item.slug]" [attr.aria-label]="item.name">
                      <img [src]="item.image" [alt]="item.name" loading="lazy" />
                    </a>
                  } @else {
                    <a class="ln__mono" [routerLink]="['/producto', item.slug]" [attr.aria-label]="item.name">
                      {{ monogram(item.name) }}
                    </a>
                  }
                  <div class="ln__body">
                    <a class="ln__name" [routerLink]="['/producto', item.slug]">{{ item.name }}</a>
                    @if (item.options.length) {
                      <p class="ln__opts">
                        @for (op of item.options; track op.type) {
                          <span class="ln__chip">{{ op.type }}: {{ op.value }}</span>
                        }
                      </p>
                    }
                    <span class="ln__unit">{{ item.price | price }} c/u</span>
                  </div>
                  <div class="ln__num">
                    <span class="ln__qty">×{{ item.qty }}</span>
                    <strong class="ln__total">{{ item.subtotal | price }}</strong>
                  </div>
                </li>
              }
            </ul>

            <dl class="ord__totals">
              <div class="ord__row">
                <dt>Subtotal</dt>
                <dd>{{ subtotal() | price }}</dd>
              </div>
              <div class="ord__row ord__row--muted">
                <dt>Unidades</dt>
                <dd>{{ count() }}</dd>
              </div>
              <div class="ord__row ord__row--grand">
                <dt>Total</dt>
                <dd>{{ subtotal() | price }}</dd>
              </div>
            </dl>

            <p class="ord__note">
              El envío y el método de pago se coordinan por WhatsApp. Los precios mostrados
              se toman del catálogo en tiempo real.
            </p>

            <div class="ord__actions">
              <a class="ord__wa" [href]="whatsappUrl()" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z"
                    stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
                Confirmar por WhatsApp
              </a>
              <a class="ord__keep" routerLink="/catalogo">Seguir comprando</a>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="ord__inner">
          <p class="ord__loading">Cargando tu pedido…</p>
        </div>
      } @else {
        <div class="ord__inner ord__empty">
          <span class="ord__empty-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4H6z"
                stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M4 6h16M16 10a4 4 0 01-8 0"
                stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <h1 class="ord__title">Pedido no disponible</h1>
          <p class="ord__sub">
            Los productos de este pedido ya no están disponibles. Arma tu pedido de nuevo
            desde el catálogo.
          </p>
          <a class="ord__keep ord__keep--solid" routerLink="/catalogo">Ir al catálogo</a>
        </div>
      }
    </section>
  `,
  styleUrl: './orden.component.scss',
})
export class OrdenComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly storefront = inject(StorefrontService);

  /** Cadena codificada del pedido (`?o=`). */
  private readonly raw = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('o') ?? '')),
    { initialValue: this.route.snapshot.queryParamMap.get('o') ?? '' },
  );

  /** Referencias decodificadas del pedido (`null` si el enlace es inválido). */
  readonly decoded = computed(() => decodeOrder(this.raw()));

  /** Líneas resueltas contra el catálogo (se omiten productos que ya no existen). */
  readonly lines = computed<OrderLine[]>(() => {
    const refs = this.decoded();
    if (!refs) {
      return [];
    }
    const out: OrderLine[] = [];
    for (const ref of refs) {
      const product = this.storefront.product(ref.slug)();
      const image = product
        ? (product.images[0]?.thumbnailUrl ?? product.images[0]?.url ?? null)
        : null;

      // Formato viejo (retrocompat): datos embebidos, precio congelado. Se muestra
      // siempre —exista o no el producto—; del catálogo solo se toma la imagen.
      if (ref.name != null && ref.price != null) {
        out.push({
          slug: ref.slug,
          name: ref.name,
          image,
          options: ref.options ?? [],
          price: ref.price,
          qty: ref.qty,
          subtotal: ref.price * ref.qty,
        });
        continue;
      }

      // Formato nuevo: todo del catálogo (se omite si el producto/variante ya no existe).
      if (!product) {
        continue;
      }
      const variant =
        product.variants.find((v) => v.id === ref.variantId) ??
        (product.hasVariants ? undefined : product.variants[0]);
      if (!variant) {
        continue;
      }
      out.push({
        slug: product.slug,
        name: product.name,
        image,
        options: variant.options.map((o) => ({ type: o.optionType, value: o.value })),
        price: variant.price,
        qty: ref.qty,
        subtotal: variant.price * ref.qty,
      });
    }
    return out;
  });

  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));
  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.subtotal, 0));

  /** `true` mientras algún producto del pedido aún no ha terminado de cargar. */
  readonly loading = computed(() => {
    const refs = this.decoded();
    if (!refs) {
      return false;
    }
    return [...new Set(refs.map((r) => r.slug))].some(
      (slug) => !this.storefront.productSettled(slug)(),
    );
  });

  /** Enlace de WhatsApp con la lista de productos + este mismo enlace de orden. */
  readonly whatsappUrl = computed(() =>
    orderWhatsappUrl(this.lines(), `${SITE_ORIGIN}/orden?o=${this.raw()}`),
  );

  constructor() {
    // Carga (SWR) los productos del pedido en cuanto cambia el enlace.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const refs = decodeOrder(p.get('o') ?? '');
      if (refs) {
        new Set(refs.map((r) => r.slug)).forEach((slug) => this.storefront.loadProduct(slug));
      }
    });

    effect(() => {
      const refs = this.decoded();
      const c = this.count();
      this.seo.update({
        title: refs ? 'Resumen de tu pedido · Ninetysix' : 'Pedido no disponible · Ninetysix',
        description: refs
          ? `Detalle de tu pedido en Ninetysix: ${c} ${c === 1 ? 'producto' : 'productos'}.`
          : 'El enlace del pedido no es válido.',
      });
    });
  }

  /** Iniciales para el mosaico cuando el producto no tiene imagen. */
  monogram(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      return '96';
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
