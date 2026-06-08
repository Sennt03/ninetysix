import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreProductCard } from '@models/storefront.models';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/**
 * Sección "New Drop": encabezado editorial + grid de tarjetas de producto.
 * Los productos provienen de los destacados (`featured`) activos del catálogo.
 */
@Component({
  selector: 'app-featured-products-section',
  imports: [ProductCardComponent, RevealOnScrollDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length) {
      <section id="destacados" class="fp">
        <header class="fp__head" appReveal>
          <div>
            <span class="fp__kicker">+ Temporada SS26</span>
            <h2 class="fp__title">New Drop <span class="fp__title-soft">SS26</span></h2>
          </div>
          <a class="fp__all" routerLink="/catalogo">
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </header>

        <div class="fp__grid">
          @for (product of products(); track product.id; let i = $index) {
            <div class="fp__item" appReveal [appRevealDelay]="(i % 4) * 90">
              <app-product-card [product]="product" />
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .fp {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(56px, 8vw, 104px) clamp(16px, 5vw, 44px);
      scroll-margin-top: 84px;
    }
    .fp__head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .fp__kicker {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
    .fp__title {
      margin: 12px 0 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.2rem, 6vw, 3.6rem);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--st-text);
    }
    .fp__title-soft {
      color: transparent;
      -webkit-text-stroke: 1.5px var(--st-line-strong);
    }
    .fp__all {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 999px;
      border: 1px solid var(--st-line-strong);
      color: var(--st-text);
      font-size: 0.84rem;
      font-weight: 700;
      text-decoration: none;
      transition: gap 0.3s ease, border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
    }
    .fp__all svg {
      width: 17px;
      height: 17px;
    }
    .fp__all:hover {
      gap: 12px;
      border-color: var(--st-lime);
      color: var(--st-lime);
      background: rgb(198 255 62 / 8%);
    }
    .fp__grid {
      margin-top: clamp(34px, 5vw, 52px);
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(10px, 2vw, 22px);
    }
    .fp__item { min-width: 0; }
    @media (min-width: 760px) {
      .fp__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (min-width: 1040px) {
      .fp__grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `,
})
export class FeaturedProductsSectionComponent {
  readonly products = input.required<StoreProductCard[]>();
}
