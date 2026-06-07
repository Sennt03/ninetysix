import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreProductCard } from '@models/storefront.models';
import { PricePipe } from '../../shared/price.pipe';

interface CardBadge {
  label: string;
  kind: 'sale' | 'new' | 'feat';
}

const NEW_WINDOW_DAYS = 30;
const MAX_DOTS = 5;

/**
 * Tarjeta de producto de la tienda. El badge se deriva de datos reales:
 *  - descuento (`-N%`) si hay precio comparado válido,
 *  - "Nuevo" si se creó en los últimos 30 días,
 *  - "Destacado" en otro caso.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="pc" [routerLink]="['/producto', product().slug]">
      <div class="pc__media">
        @if (image()) {
          <img class="pc__img" [src]="image()" [alt]="product().imageAlt" loading="lazy" decoding="async" />
        } @else {
          <div class="pc__placeholder" aria-hidden="true"></div>
        }

        @if (badge(); as b) {
          <span class="pc__badge" [class.pc__badge--sale]="b.kind === 'sale'">{{ b.label }}</span>
        }

        @if (!product().inStock) {
          <span class="pc__soldout">Agotado</span>
        }

        <span class="pc__overlay" aria-hidden="true"></span>
      </div>

      <div class="pc__body">
        @if (showCategory() && product().categoryName) {
          <span class="pc__kicker">{{ product().categoryName }}</span>
        }
        <h3 class="pc__name">{{ product().name }}</h3>

        @if (product().price != null) {
          <div class="pc__price">
            @if (product().comparePrice != null) {
              <span class="pc__compare">{{ product().comparePrice | price }}</span>
            }
            <span class="pc__amount">{{ product().price | price }}</span>
          </div>
        }

        @if (product().colors.length) {
          <div class="pc__colors" [attr.aria-label]="product().colors.length + ' colores disponibles'">
            @for (c of dots(); track $index) {
              <span class="pc__dot" [style.background]="c" aria-hidden="true"></span>
            }
            @if (extraColors() > 0) {
              <span class="pc__more">+{{ extraColors() }}</span>
            }
          </div>
        }

        <span class="pc__cta">
          Ver detalles
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    </a>
  `,
  styles: `
    .pc {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      border-radius: var(--st-radius);
      overflow: hidden;
      background: var(--st-white);
      box-shadow: 0 1px 2px rgb(43 29 24 / 6%);
      transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s ease;
    }
    .pc:hover {
      transform: translateY(-6px);
      box-shadow: var(--st-shadow);
    }
    .pc__media {
      position: relative;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      background: var(--st-sand);
    }
    .pc__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .pc:hover .pc__img {
      transform: scale(1.06);
    }
    .pc__placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--st-sand), var(--st-taupe));
    }
    .pc__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 55%, rgb(36 26 22 / 22%));
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .pc:hover .pc__overlay {
      opacity: 1;
    }
    .pc__badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--st-espresso);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 6px 18px -8px rgb(36 26 22 / 60%);
    }
    .pc__badge--sale {
      background: var(--st-rose-deep);
    }
    .pc__soldout {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 5px 11px;
      border-radius: 999px;
      background: rgb(255 255 255 / 92%);
      color: var(--st-espresso);
      font-size: 0.72rem;
      font-weight: 600;
    }
    .pc__body {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 16px 16px 18px;
    }
    .pc__kicker {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--st-rose);
    }
    .pc__name {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 600;
      color: var(--st-espresso);
      line-height: 1.3;
    }
    .pc__price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 2px;
    }
    .pc__amount {
      font-weight: 700;
      color: var(--st-espresso);
      font-size: 1.02rem;
    }
    .pc__compare {
      font-size: 0.84rem;
      color: var(--st-muted);
      text-decoration: line-through;
    }
    .pc__colors {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .pc__dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 1.5px solid var(--st-white);
      box-shadow: 0 0 0 1px var(--st-line);
    }
    .pc__more {
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--st-muted);
    }
    .pc__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      color: var(--st-muted);
      font-size: 0.86rem;
      font-weight: 500;
      transition: gap 0.3s ease, color 0.3s ease;
    }
    .pc__cta svg {
      width: 16px;
      height: 16px;
    }
    .pc:hover .pc__cta {
      color: var(--st-rose-deep);
      gap: 11px;
    }
  `,
})
export class ProductCardComponent {
  readonly product = input.required<StoreProductCard>();
  /** Muestra el nombre de la categoría como kicker (se oculta en la PLP). */
  readonly showCategory = input(true);

  readonly image = computed(() => {
    const p = this.product();
    return p.thumbnailUrl ?? p.imageUrl;
  });

  readonly dots = computed(() => this.product().colors.slice(0, MAX_DOTS));
  readonly extraColors = computed(() => Math.max(0, this.product().colors.length - MAX_DOTS));

  readonly badge = computed<CardBadge | null>(() => {
    const p = this.product();
    if (p.comparePrice && p.price && p.comparePrice > p.price) {
      const pct = Math.round((1 - p.price / p.comparePrice) * 100);
      if (pct > 0) {
        return { label: `-${pct}%`, kind: 'sale' };
      }
    }
    if (this.isRecent(p.createdAt)) {
      return { label: 'Nuevo', kind: 'new' };
    }
    return { label: 'Destacado', kind: 'feat' };
  });

  private isRecent(iso: string): boolean {
    const created = new Date(iso).getTime();
    if (Number.isNaN(created)) {
      return false;
    }
    const ageDays = (Date.now() - created) / 86_400_000;
    return ageDays <= NEW_WINDOW_DAYS;
  }
}
