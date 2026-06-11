import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from '@services/seo.service';
import { CartDrawerComponent } from '../components/cart-drawer/cart-drawer.component';
import { StoreFooterComponent } from '../components/store-footer/store-footer.component';
import { StoreHeaderComponent } from '../components/store-header/store-header.component';
import {
  STORE_INSTAGRAM,
  STORE_TIKTOK,
  STORE_WHATSAPP_NUMBER,
} from '../shared/store.config';

/**
 * Layout de la tienda pública: cabecera + contenido + pie, y define los tokens
 * de marca cálidos (`--st-*`) que heredan todos los componentes de la tienda.
 * Es el componente padre común de todas las páginas públicas (SSR).
 */
@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, StoreHeaderComponent, StoreFooterComponent, CartDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="store-shell">
      <app-store-header />
      <main class="store-shell__main"><router-outlet /></main>
      <app-store-footer />
      <app-cart-drawer />
    </div>
  `,
  styleUrl: './store-layout.component.scss',
})
export class StoreLayoutComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    const origin = this.seo.siteOrigin;
    // Datos estructurados globales (persisten entre navegaciones).
    this.seo.setJsonLd(
      'ld-organization',
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Ninetysix',
        url: origin,
        sameAs: [STORE_INSTAGRAM, STORE_TIKTOK],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: `+${STORE_WHATSAPP_NUMBER}`,
          contactType: 'customer service',
          areaServed: 'EC',
        },
      },
      'global',
    );
    this.seo.setJsonLd(
      'ld-website',
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Ninetysix', url: origin },
      'global',
    );
  }
}
