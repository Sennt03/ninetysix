import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BRAND_LOGO,
  STORE_CITY,
  STORE_INSTAGRAM,
  STORE_NAV,
  STORE_PHONE_DISPLAY,
  STORE_TIKTOK,
  STORE_WHATSAPP,
} from '../../shared/store.config';

/** Pie de página de la tienda (streetwear dark): marca, navegación, contacto y
 * redes (TikTok, Instagram y WhatsApp). */
@Component({
  selector: 'app-store-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ft">
      <div class="ft__inner">
        <div class="ft__brand-col">
          <a class="ft__brand" routerLink="/" aria-label="Ninetysix — Inicio">
            <img class="ft__logo" [src]="logo" alt="Ninetysix" width="120" height="91" />
          </a>
          <p class="ft__tagline">
            Streetwear premium con actitud sin límites. Ediciones limitadas para la calle.
          </p>
          <div class="ft__social">
            <a class="ft__social-btn" [href]="instagram" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.6" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" />
                <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a class="ft__social-btn" [href]="tiktok" target="_blank" rel="noopener" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16 3c.3 2.2 1.8 3.9 4 4.2v3c-1.5 0-2.9-.5-4-1.3V15a6 6 0 11-6-6c.34 0 .67.03 1 .09v3.04A3 3 0 1013 15V3h3z"
                  fill="currentColor" />
              </svg>
            </a>
            <a class="ft__social-btn" [href]="whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M9 8.5c.2 2.5 2 4.3 4.5 4.5.6 0 1.2-.6 1.2-1.2l-1.6-.8-.8.8a4 4 0 01-1.6-1.6l.8-.8-.8-1.6c-.6 0-1.3.6-1.3 1.2z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <nav class="ft__col" aria-label="Navegación">
          <h3 class="ft__title">Navegación</h3>
          <ul class="ft__list">
            @for (item of nav; track item.link) {
              <li><a class="ft__link" [routerLink]="item.link">{{ item.label }}</a></li>
            }
          </ul>
        </nav>

        <div class="ft__col">
          <h3 class="ft__title">Contacto</h3>
          <ul class="ft__list">
            <li><a class="ft__link" [href]="'tel:' + phoneRaw">{{ phone }}</a></li>
            <li><span class="ft__muted">{{ city }}</span></li>
          </ul>
        </div>

        <div class="ft__col ft__col--news">
          <h3 class="ft__title">¿Hablamos?</h3>
          <p class="ft__news-text">Escríbenos por WhatsApp para pedidos, tallas y novedades de cada drop.</p>
          <a class="ft__wa-link" [href]="whatsapp" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="M9 8.5c.2 2.5 2 4.3 4.5 4.5.6 0 1.2-.6 1.2-1.2l-1.6-.8-.8.8a4 4 0 01-1.6-1.6l.8-.8-.8-1.6c-.6 0-1.3.6-1.3 1.2z" fill="currentColor" />
            </svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>

      <div class="ft__bottom">
        <span>© {{ year }} Ninetysix. Todos los derechos reservados.</span>
        <span class="ft__bottom-tag">Streetwear without limits.</span>
      </div>
    </footer>
  `,
  styleUrl: './store-footer.component.scss',
})
export class StoreFooterComponent {
  readonly year = new Date().getFullYear();
  readonly nav = STORE_NAV;
  readonly logo = BRAND_LOGO;
  readonly whatsapp = STORE_WHATSAPP;
  readonly instagram = STORE_INSTAGRAM;
  readonly tiktok = STORE_TIKTOK;
  readonly phone = STORE_PHONE_DISPLAY;
  readonly phoneRaw = STORE_PHONE_DISPLAY.replace(/\s+/g, '');
  readonly city = STORE_CITY;
}
