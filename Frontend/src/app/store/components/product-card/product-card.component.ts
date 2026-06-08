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
 * Tarjeta de producto de la tienda (streetwear dark). Al pasar el cursor aparece
 * un botón "Ver producto" sobre la imagen. El badge se deriva de datos reales:
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
          <div class="pc__placeholder" aria-hidden="true">{{ initial() }}</div>
        }

        @if (badge(); as b) {
          <span
            class="pc__badge"
            [class.pc__badge--sale]="b.kind === 'sale'"
            [class.pc__badge--new]="b.kind === 'new'"
          >{{ b.label }}</span>
        }

        @if (!product().inStock) {
          <span class="pc__soldout">Agotado</span>
        }

        <span class="pc__overlay" aria-hidden="true"></span>
        <span class="pc__view">
          Ver producto
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <div class="pc__body">
        <div class="pc__head">
          @if (showCategory() && product().categoryName) {
            <span class="pc__kicker">{{ product().categoryName }}</span>
          }
          <h3 class="pc__name">{{ product().name }}</h3>
        </div>

        @if (product().price != null) {
          <div class="pc__price">
            <span class="pc__amount">{{ product().price | price }}</span>
            @if (product().comparePrice != null) {
              <span class="pc__compare">{{ product().comparePrice | price }}</span>
            }
          </div>
        }
      </div>

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
    </a>
  `,
  styles: `
    .pc {
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 0;
      container-type: inline-size;
      text-decoration: none;
      color: inherit;
      border-radius: var(--st-radius-lg);
      padding: 10px 10px 16px;
      background: var(--st-surface);
      border: 1px solid var(--st-line);
      transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
        box-shadow 0.4s ease, border-color 0.4s ease;
    }
    .pc:hover {
      transform: translateY(-8px);
      border-color: rgb(198 255 62 / 35%);
      box-shadow: var(--st-shadow), var(--st-shadow-lime);
    }
    .pc__media {
      position: relative;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      border-radius: var(--st-radius);
      background: var(--st-surface-2);
    }
    .pc__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .pc:hover .pc__img {
      transform: scale(1.07);
    }
    .pc__placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      font-family: var(--st-font-display);
      font-size: 3rem;
      font-weight: 800;
      color: rgb(255 255 255 / 14%);
      background: linear-gradient(135deg, var(--st-surface-2), var(--st-elev));
    }
    .pc__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 45%, rgb(10 11 10 / 78%));
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .pc:hover .pc__overlay {
      opacity: 1;
    }
    .pc__view {
      position: absolute;
      left: 50%;
      bottom: 16px;
      transform: translate(-50%, 14px);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 999px;
      background: var(--st-lime);
      color: var(--st-lime-ink);
      font-size: 0.84rem;
      font-weight: 700;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.35s ease, transform 0.35s ease;
      box-shadow: 0 12px 30px -10px var(--st-lime-glow);
    }
    .pc__view svg {
      width: 16px;
      height: 16px;
    }
    .pc:hover .pc__view {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    .pc__badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgb(10 11 10 / 70%);
      backdrop-filter: blur(6px);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border: 1px solid var(--st-line-strong);
    }
    .pc__badge--new {
      background: var(--st-lime);
      color: var(--st-lime-ink);
      border-color: transparent;
      box-shadow: 0 8px 20px -8px var(--st-lime-glow);
    }
    .pc__badge--sale {
      background: #ff4d4d;
      color: #fff;
      border-color: transparent;
    }
    .pc__soldout {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 5px 11px;
      border-radius: 999px;
      background: rgb(10 11 10 / 80%);
      color: var(--st-muted);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .pc__body {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 6px 0;
    }
    .pc__head {
      min-width: 0;
    }
    .pc__kicker {
      display: block;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--st-lime);
      margin-bottom: 4px;
    }
    .pc__name {
      margin: 0;
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--st-text);
      line-height: 1.3;
    }
    .pc__price {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .pc__amount {
      font-weight: 800;
      color: var(--st-text);
      font-size: 1rem;
    }
    .pc__compare {
      font-size: 0.78rem;
      color: var(--st-faint);
      text-decoration: line-through;
    }
    .pc__colors {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 0 6px;
    }
    .pc__dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 1px solid var(--st-line-strong);
    }
    .pc__more {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--st-faint);
    }

    /* Tarjetas estrechas (p. ej. 2 columnas en móvil): apila nombre y precio
       para que no se solapen ni desborden. */
    @container (max-width: 200px) {
      .pc__body {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .pc__price {
        flex-direction: row;
        align-items: baseline;
        gap: 8px;
      }
      .pc__view {
        padding: 9px 14px;
        font-size: 0.78rem;
      }
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

  readonly initial = computed(() => this.product().name.charAt(0).toUpperCase());

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
