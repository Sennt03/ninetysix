import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORE_NAV } from '../../shared/store.config';

/** Pie de página de la tienda: marca, navegación, contacto y redes sociales. */
@Component({
  selector: 'app-store-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ft">
      <div class="ft__inner">
        <div class="ft__brand-col">
          <span class="ft__brand">Ninetysix</span>
          <p class="ft__tagline">Elegancia, confianza y estilo para el hombre moderno.</p>
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
          <ul class="ft__list ft__list--contact">
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
              <a class="ft__link" href="tel:+51987654321">+51 987 654 321</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
                <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
              <a class="ft__link" href="mailto:contacto@ninetysix.com">contacto&#64;ninetysix.com</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.5" />
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <span>Lima, Perú</span>
            </li>
          </ul>
        </div>

        <div class="ft__col">
          <h3 class="ft__title">Síguenos</h3>
          <div class="ft__social">
            <a class="ft__social-btn" href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
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
            <a class="ft__social-btn" href="https://wa.me/51987654321" target="_blank" rel="noopener" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M9 8.5c.2 2.5 2 4.3 4.5 4.5.6 0 1.2-.6 1.2-1.2l-1.6-.8-.8.8a4 4 0 01-1.6-1.6l.8-.8-.8-1.6c-.6 0-1.3.6-1.3 1.2z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="ft__bottom">
        <span>© {{ year }} Ninetysix. Todos los derechos reservados.</span>
      </div>
    </footer>
  `,
  styleUrl: './store-footer.component.scss',
})
export class StoreFooterComponent {
  readonly year = new Date().getFullYear();
  readonly nav = STORE_NAV;
}
