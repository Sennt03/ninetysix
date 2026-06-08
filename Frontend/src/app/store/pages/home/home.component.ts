import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { CollectionsSectionComponent } from './sections/collections-section.component';
import { CtaSectionComponent } from './sections/cta-section.component';
import { FeaturedProductsSectionComponent } from './sections/featured-products-section.component';
import { HeroSectionComponent } from './sections/hero-section.component';
import { InstagramSectionComponent } from './sections/instagram-section.component';

/**
 * Portada de la tienda (`/`). Renderizada con SSR para SEO. Los datos dinámicos
 * (categorías y productos destacados) provienen del catálogo del panel a través
 * de `StorefrontService`, que aplica la estrategia stale-while-revalidate.
 */
@Component({
  selector: 'app-home',
  imports: [
    HeroSectionComponent,
    FeaturedProductsSectionComponent,
    CollectionsSectionComponent,
    CtaSectionComponent,
    InstagramSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section />
    <app-featured-products-section [products]="featuredProducts()" />
    <app-collections-section [collections]="collections()" />
    <app-cta-section />
    <app-instagram-section />
  `,
})
export class HomeComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly seo = inject(SeoService);

  private readonly home = this.storefront.home;

  readonly collections = computed(() => this.home()?.collections ?? []);
  readonly featuredProducts = computed(() => this.home()?.featuredProducts ?? []);

  constructor() {
    this.seo.update({
      title: 'Ninetysix · Streetwear sin límites',
      description:
        'Ninetysix — streetwear premium. Drops de edición limitada, prendas oversized y esenciales urbanos con actitud sin límites.',
    });
    // Dispara la carga (SSR: render con datos; cliente: hidratación + revalidación).
    this.storefront.loadHome();
  }
}
