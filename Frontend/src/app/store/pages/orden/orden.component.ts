import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '@env/environment';
import { SeoService } from '@services/seo.service';
import { map } from 'rxjs';
import { decodeOrder, orderWhatsappUrl } from '../../shared/order-link';
import { PricePipe } from '../../shared/price.pipe';

const SITE_ORIGIN = environment.url_site.replace(/\/+$/, '');

/**
 * Página de orden: reconstruye el detalle real del pedido a partir del enlace
 * codificado (base64url en `?o=`). Muestra productos, variantes, cantidades,
 * precios y total con el estilo streetwear de la tienda. No registra órdenes:
 * el enlace es autocontenido y representa lo que el cliente quiere comprar.
 */
@Component({
  selector: 'app-orden',
  imports: [RouterLink, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ord">
      <span class="ord__grid" aria-hidden="true"></span>
      <span class="ord__glow" aria-hidden="true"></span>

      @if (order(); as o) {
        <div class="ord__inner">
          <header class="ord__head">
            <span class="ord__eyebrow">
              <span class="ord__dot" aria-hidden="true"></span>
              Pedido Ninetysix
            </span>
            <h1 class="ord__title">Resumen de tu pedido</h1>
            <p class="ord__sub">
              {{ o.count }} {{ o.count === 1 ? 'producto' : 'productos' }} ·
              este es el detalle real que enviaste por WhatsApp.
            </p>
          </header>

          <div class="ord__card">
            <ul class="ord__list">
              @for (item of o.items; track $index) {
                <li class="ln">
                  <span class="ln__mono" aria-hidden="true">{{ monogram(item.name) }}</span>
                  <div class="ln__body">
                    @if (item.slug) {
                      <a class="ln__name" [routerLink]="['/producto', item.slug]">{{ item.name }}</a>
                    } @else {
                      <span class="ln__name">{{ item.name }}</span>
                    }
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
                    <strong class="ln__total">{{ item.price * item.qty | price }}</strong>
                  </div>
                </li>
              }
            </ul>

            <dl class="ord__totals">
              <div class="ord__row">
                <dt>Subtotal</dt>
                <dd>{{ o.subtotal | price }}</dd>
              </div>
              <div class="ord__row ord__row--muted">
                <dt>Unidades</dt>
                <dd>{{ o.count }}</dd>
              </div>
              <div class="ord__row ord__row--grand">
                <dt>Total</dt>
                <dd>{{ o.subtotal | price }}</dd>
              </div>
            </dl>

            <p class="ord__note">
              El envío y el método de pago se coordinan por WhatsApp. Los precios mostrados
              corresponden al pedido tal como fue generado.
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
            El enlace del pedido no es válido o está incompleto. Arma tu pedido de nuevo
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

  /** Cadena codificada del pedido (`?o=`). */
  private readonly raw = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('o') ?? '')),
    { initialValue: this.route.snapshot.queryParamMap.get('o') ?? '' },
  );

  readonly order = computed(() => decodeOrder(this.raw()));

  /** Enlace de WhatsApp con la lista de productos + este mismo enlace de orden. */
  readonly whatsappUrl = computed(() => {
    const o = this.order();
    if (!o) {
      return '';
    }
    return orderWhatsappUrl(o.items, `${SITE_ORIGIN}/orden?o=${this.raw()}`);
  });

  constructor() {
    effect(() => {
      const o = this.order();
      this.seo.update({
        title: o ? 'Resumen de tu pedido · Ninetysix' : 'Pedido no disponible · Ninetysix',
        description: o
          ? `Detalle de tu pedido en Ninetysix: ${o.count} ${o.count === 1 ? 'producto' : 'productos'}.`
          : 'El enlace del pedido no es válido.',
      });
    });
  }

  /** Iniciales para el mosaico cuando no hay imagen embebida en el enlace. */
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
