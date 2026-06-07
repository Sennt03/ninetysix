import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { CollectionsSectionComponent } from './sections/collections-section.component';
import { CtaSectionComponent } from './sections/cta-section.component';
import { FeaturedProductsSectionComponent } from './sections/featured-products-section.component';
import { HeroSectionComponent } from './sections/hero-section.component';
import { TestimonialsSectionComponent } from './sections/testimonials-section.component';

/**
 * Portada de la tienda (`/`). Renderizada con SSR para SEO. Los datos dinámicos
 * (colecciones y productos destacados) provienen del catálogo del panel a través
 * de `StorefrontService`, que aplica la estrategia stale-while-revalidate.
 */
@Component({
  selector: 'app-home',
  imports: [
    HeroSectionComponent,
    CollectionsSectionComponent,
    FeaturedProductsSectionComponent,
    TestimonialsSectionComponent,
    CtaSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section />
    <app-collections-section [collections]="collections()" />
    <app-featured-products-section [products]="featuredProducts()" />
    <app-testimonials-section />
    <app-cta-section />
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
      title: 'Ninetysix · Elegancia y estilo para el hombre moderno',
      description:
        'Ninetysix — moda masculina premium. Descubre colecciones exclusivas y las prendas más populares para el hombre moderno.',
    });
    // Dispara la carga (SSR: render con datos; cliente: hidratación + revalidación).
    this.storefront.loadHome();
  }
}
