import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { CollectionCardComponent } from '../../components/collection-card/collection-card.component';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

/** Página "Catálogo": hero + grid con TODAS las categorías activas. */
@Component({
  selector: 'app-catalogo',
  imports: [PageHeroComponent, CollectionCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero pill="Catálogo" title="Nuestro Catálogo"
      subtitle="Explora nuestras colecciones exclusivas diseñadas para el hombre moderno">
      <svg ph-icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7" />
      </svg>
    </app-page-hero>

    <section class="cat">
      @if (categories().length) {
        <div class="cat__grid">
          @for (c of categories(); track c.slug; let i = $index) {
            <div appReveal [appRevealDelay]="(i % 3) * 80">
              <app-collection-card [collection]="c" [countPill]="true" />
            </div>
          }
        </div>
      } @else {
        <p class="cat__empty">Aún no hay categorías disponibles.</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .cat {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(48px, 7vw, 90px) clamp(16px, 5vw, 40px);
    }
    .cat__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 2.5vw, 26px);
    }
    .cat__empty {
      text-align: center;
      color: var(--st-muted);
      padding: 40px 0;
    }
    @media (min-width: 600px) {
      .cat__grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 980px) {
      .cat__grid { grid-template-columns: repeat(3, 1fr); }
    }
  `,
})
export class CatalogoComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly seo = inject(SeoService);

  readonly categories = computed(() => this.storefront.catalog()?.categories ?? []);

  constructor() {
    this.seo.update({
      title: 'Catálogo · Ninetysix',
      description:
        'Explora todas las colecciones de Ninetysix: camisas, trajes, conjuntos, accesorios y más moda masculina premium.',
    });
    this.storefront.loadCatalog();
  }
}
