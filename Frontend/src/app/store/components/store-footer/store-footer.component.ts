import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  STORE_CITY,
  STORE_EMAIL,
  STORE_INSTAGRAM,
  STORE_NAV,
  STORE_PHONE_DISPLAY,
  STORE_WHATSAPP,
} from '../../shared/store.config';

/** Pie de página de la tienda (streetwear dark): marca, navegación, contacto,
 * redes y suscripción a la newsletter. */
@Component({
  selector: 'app-store-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ft">
      <div class="ft__inner">
        <div class="ft__brand-col">
          <a class="ft__brand" routerLink="/">Ninety<span class="ft__brand-accent">six</span></a>
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
            <a class="ft__social-btn" href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 9V7c0-1 .5-1.5 1.5-1.5H17V2.5h-2.5C12 2.5 10.5 4 10.5 6.8V9H8.5v3h2v9.5h3.5V12H17l.5-3H14z"
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
            <li><a class="ft__link" [href]="'mailto:' + email">{{ email }}</a></li>
            <li><span class="ft__muted">{{ city }}</span></li>
          </ul>
        </div>

        <div class="ft__col ft__col--news">
          <h3 class="ft__title">Newsletter</h3>
          <p class="ft__news-text">Suscríbete y entérate de cada drop antes que nadie.</p>
          @if (subscribed()) {
            <p class="ft__news-ok">¡Gracias! Te avisaremos del próximo drop.</p>
          } @else {
            <form class="ft__news-form" (submit)="subscribe($event)">
              <input
                class="ft__news-input"
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
                aria-label="Tu correo electrónico"
              />
              <button class="ft__news-btn" type="submit" aria-label="Suscribirme">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </form>
          }
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
  readonly whatsapp = STORE_WHATSAPP;
  readonly instagram = STORE_INSTAGRAM;
  readonly email = STORE_EMAIL;
  readonly phone = STORE_PHONE_DISPLAY;
  readonly phoneRaw = STORE_PHONE_DISPLAY.replace(/\s+/g, '');
  readonly city = STORE_CITY;
  readonly subscribed = signal(false);

  subscribe(event: Event): void {
    event.preventDefault();
    this.subscribed.set(true);
  }
}
