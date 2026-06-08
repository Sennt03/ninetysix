import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreProductCard } from '@models/storefront.models';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { PricePipe } from '../../shared/price.pipe';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

/**
 * Página "Destacados": los productos marcados como `featured`. El primero se
 * muestra como banner editorial a lo ancho; el resto en grid.
 */
@Component({
  selector: 'app-destacados',
  imports: [PageHeaderComponent, ProductCardComponent, RouterLink, PricePipe, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="+ Selección" title="Destacados"
      subtitle="Los productos más codiciados de NINETY SIX. Selección curada de la temporada." />

    <section class="ds">
      @if (featured(); as list) {
        @if (list.length) {
          @if (hero(); as h) {
            <a class="ds__hero" [routerLink]="['/producto', h.slug]" appReveal>
              @if (heroImage()) {
                <img class="ds__hero-img" [src]="heroImage()" [alt]="h.imageAlt || h.name" loading="eager" decoding="async" />
              }
              <span class="ds__hero-shade" aria-hidden="true"></span>
              <div class="ds__hero-content">
                <span class="ds__hero-tag">Destacado de la temporada</span>
                <h2 class="ds__hero-name">{{ h.name }}</h2>
                <div class="ds__hero-foot">
                  @if (h.price != null) {
                    <span class="ds__hero-price">{{ h.price | price }}</span>
                  }
                  <span class="ds__hero-btn">
                    Ver producto
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          }

          @if (rest().length) {
            <div class="ds__grid">
              @for (p of rest(); track p.id; let i = $index) {
                <div appReveal [appRevealDelay]="(i % 4) * 70">
                  <app-product-card [product]="p" />
                </div>
              }
            </div>
          }
        } @else {
          <p class="ds__empty">Aún no hay productos destacados.</p>
        }
      } @else {
        <span class="ds__sk ds__sk--hero" aria-hidden="true"></span>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .ds {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(8px, 2vw, 24px) clamp(16px, 5vw, 44px) clamp(60px, 9vw, 110px);
    }
    .ds__hero {
      position: relative;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      border-radius: var(--st-radius-xl);
      border: 1px solid var(--st-line);
      min-height: clamp(360px, 56vw, 560px);
      text-decoration: none;
      isolation: isolate;
    }
    .ds__hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .ds__hero:hover .ds__hero-img { transform: scale(1.05); }
    .ds__hero-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgb(10 11 10 / 92%) 0%, rgb(10 11 10 / 35%) 55%, rgb(10 11 10 / 10%) 100%);
    }
    .ds__hero-content {
      position: relative;
      z-index: 1;
      padding: clamp(24px, 4vw, 48px);
      width: 100%;
    }
    .ds__hero-tag {
      display: block;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
    .ds__hero-name {
      margin: 12px 0 0;
      font-family: var(--st-font-display);
      font-size: clamp(1.8rem, 5vw, 3.4rem);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      color: #fff;
    }
    .ds__hero-foot {
      margin-top: 22px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .ds__hero-price {
      font-size: clamp(1.2rem, 3vw, 1.6rem);
      font-weight: 800;
      color: #fff;
    }
    .ds__hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 13px 26px;
      border-radius: 999px;
      background: var(--st-lime);
      color: var(--st-lime-ink);
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 16px 40px -16px var(--st-lime-glow);
      transition: transform 0.3s ease, gap 0.3s ease, filter 0.3s ease;
    }
    .ds__hero-btn svg { width: 17px; height: 17px; }
    .ds__hero:hover .ds__hero-btn { transform: translateY(-2px); gap: 14px; filter: brightness(1.05); }

    .ds__grid {
      margin-top: clamp(20px, 3vw, 28px);
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(10px, 2vw, 22px);
    }
    .ds__grid > * { min-width: 0; }
    @media (min-width: 760px) { .ds__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (min-width: 1100px) { .ds__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

    .ds__empty { color: var(--st-muted); padding: 40px 0; }
    .ds__sk--hero {
      display: block;
      border-radius: var(--st-radius-xl);
      min-height: clamp(360px, 56vw, 560px);
      background: linear-gradient(100deg, var(--st-surface) 30%, var(--st-surface-2) 50%, var(--st-surface) 70%);
      background-size: 200% 100%;
      animation: dssk 1.3s ease-in-out infinite;
    }
    @keyframes dssk { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    @media (prefers-reduced-motion: reduce) { .ds__sk--hero { animation: none; } }
  `,
})
export class DestacadosComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly seo = inject(SeoService);

  readonly featured = computed(() => this.storefront.featured());
  readonly hero = computed<StoreProductCard | null>(() => this.featured()?.[0] ?? null);
  readonly rest = computed(() => this.featured()?.slice(1) ?? []);
  readonly heroImage = computed(() => {
    const h = this.hero();
    return h ? h.imageUrl ?? h.thumbnailUrl : null;
  });

  constructor() {
    this.seo.update({
      title: 'Destacados · Ninetysix',
      description: 'Los productos destacados de Ninetysix: la selección curada de la temporada.',
    });
    this.storefront.loadFeatured();
  }
}
