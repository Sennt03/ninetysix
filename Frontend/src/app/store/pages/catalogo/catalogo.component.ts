import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

/**
 * Catálogo (PLP): encabezado + sidebar de categorías (orden del panel) + grid de
 * productos. La categoría seleccionada filtra el grid contra la API (`''` = todos).
 */
@Component({
  selector: 'app-catalogo',
  imports: [PageHeaderComponent, ProductCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="+ Colección" title="Catálogo"
      subtitle="Explora todas las prendas Ninetysix. Filtra por categoría y encuentra tu próximo drop." />

    <section class="ct">
      <aside class="ct__side">
        <span class="ct__side-label">Categorías</span>
        <nav class="ct__nav" aria-label="Filtrar por categoría">
          <button
            type="button"
            class="ct__cat"
            [class.is-active]="selected() === ''"
            (click)="selectCat('')"
          >
            Todos
            <span class="ct__count">{{ totalCount() }}</span>
          </button>
          @for (c of categories(); track c.slug) {
            <button
              type="button"
              class="ct__cat"
              [class.is-active]="selected() === c.slug"
              (click)="selectCat(c.slug)"
            >
              {{ c.name }}
              <span class="ct__count">{{ c.productCount }}</span>
            </button>
          }
        </nav>
      </aside>

      <div class="ct__main">
        @if (products(); as list) {
          @if (list.length) {
            <div class="ct__grid">
              @for (p of list; track p.id; let i = $index) {
                <div appReveal [appRevealDelay]="(i % 4) * 70">
                  <app-product-card [product]="p" />
                </div>
              }
            </div>
          } @else {
            <p class="ct__empty">No hay productos en esta categoría todavía.</p>
          }
        } @else {
          <div class="ct__grid" aria-hidden="true">
            @for (s of skeletons; track s) {
              <span class="ct__sk"></span>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .ct {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(20px, 3vw, 36px) clamp(16px, 5vw, 44px) clamp(60px, 9vw, 110px);
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(24px, 4vw, 44px);
      align-items: start;
    }
    .ct__side-label {
      display: block;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--st-faint);
      margin-bottom: 14px;
    }
    .ct__nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .ct__cat {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 11px 16px;
      border-radius: 999px;
      border: 1px solid var(--st-line);
      background: var(--st-surface);
      color: var(--st-muted);
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, transform 0.2s ease;
    }
    .ct__cat:hover {
      color: var(--st-text);
      border-color: var(--st-line-strong);
      transform: translateX(2px);
    }
    .ct__cat.is-active {
      background: var(--st-lime);
      border-color: transparent;
      color: var(--st-lime-ink);
      box-shadow: 0 10px 26px -12px var(--st-lime-glow);
    }
    .ct__count {
      font-size: 0.74rem;
      font-weight: 700;
      opacity: 0.7;
    }
    .ct__cat.is-active .ct__count { opacity: 0.85; }

    .ct__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(10px, 2vw, 22px);
    }
    .ct__grid > * { min-width: 0; }
    .ct__empty {
      color: var(--st-muted);
      padding: 40px 0;
    }
    .ct__sk {
      display: block;
      border-radius: var(--st-radius-lg);
      aspect-ratio: 3 / 4.4;
      background: linear-gradient(100deg, var(--st-surface) 30%, var(--st-surface-2) 50%, var(--st-surface) 70%);
      background-size: 200% 100%;
      animation: ctsk 1.3s ease-in-out infinite;
    }
    @keyframes ctsk { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    @media (prefers-reduced-motion: reduce) { .ct__sk { animation: none; } }

    @media (min-width: 760px) {
      .ct__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1000px) {
      .ct {
        grid-template-columns: 232px minmax(0, 1fr);
      }
      .ct__side {
        position: sticky;
        top: 96px;
      }
      .ct__nav { flex-direction: column; }
      .ct__cat { justify-content: space-between; width: 100%; }
      .ct__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1280px) {
      .ct__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
  `,
})
export class CatalogoComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly seo = inject(SeoService);

  readonly selected = signal('');
  readonly skeletons = [0, 1, 2, 3, 4, 5, 6, 7];

  readonly categories = computed(() => this.storefront.catalog()?.categories ?? []);
  readonly products = computed(() => this.storefront.products(this.selected())());

  readonly totalCount = computed(() =>
    this.categories().reduce((sum, c) => sum + (c.productCount ?? 0), 0),
  );

  constructor() {
    this.seo.update({
      title: 'Catálogo · Ninetysix',
      description:
        'Explora todo el catálogo Ninetysix: hoodies, tees, joggers, cargos y más streetwear premium. Filtra por categoría.',
    });
    this.storefront.loadCatalog();
    this.storefront.loadProducts('');
  }

  selectCat(slug: string): void {
    this.selected.set(slug);
    this.storefront.loadProducts(slug);
  }
}
