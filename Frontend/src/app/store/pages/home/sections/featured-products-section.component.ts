import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoreProductCard } from '@models/storefront.models';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { SectionHeadingComponent } from '../../../components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/**
 * Sección "Productos Destacados": encabezado + grid de tarjetas de producto.
 * Los productos provienen de los destacados (`featured`) activos del catálogo.
 */
@Component({
  selector: 'app-featured-products-section',
  imports: [ProductCardComponent, SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length) {
      <section id="destacados" class="fp">
        <app-section-heading
          pill="Lo Más Popular"
          title="Productos Destacados"
          subtitle="Descubre las prendas favoritas de nuestros clientes"
        >
          <svg sh-icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </app-section-heading>

        <div class="fp__grid">
          @for (product of products(); track product.id; let i = $index) {
            <div class="fp__item" appReveal [appRevealDelay]="(i % 4) * 80">
              <app-product-card [product]="product" />
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .fp {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(50px, 8vw, 96px) clamp(16px, 5vw, 40px);
      scroll-margin-top: 84px;
    }
    .fp__grid {
      margin-top: clamp(34px, 5vw, 56px);
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: clamp(14px, 2.4vw, 26px);
    }
    @media (min-width: 760px) {
      .fp__grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (min-width: 1040px) {
      .fp__grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `,
})
export class FeaturedProductsSectionComponent {
  readonly products = input.required<StoreProductCard[]>();
}
