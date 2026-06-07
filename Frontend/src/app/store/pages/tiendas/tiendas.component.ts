import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '@services/seo.service';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

interface StoreInput {
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface Store extends StoreInput {
  tel: string;
  directions: string;
  mapEmbed: SafeResourceUrl;
}

/** Página "Nuestras Tiendas": hero + tarjetas de tienda con datos y mapa. */
@Component({
  selector: 'app-tiendas',
  imports: [PageHeroComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero pill="Encuéntranos" title="Nuestras Tiendas"
      subtitle="Visítanos y descubre la experiencia Ninetysix">
      <svg ph-icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.6" />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
      </svg>
    </app-page-hero>

    <section class="st">
      @for (s of stores; track s.name; let i = $index) {
        <article class="store" appReveal [appRevealDelay]="i * 80">
          <div class="store__info">
            <h2 class="store__name">{{ s.name }}</h2>

            <ul class="store__rows">
              <li class="store__row">
                <span class="store__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.6" />
                    <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
                  </svg>
                </span>
                <div><span class="store__label">Dirección</span><span class="store__val">{{ s.address }}</span></div>
              </li>
              <li class="store__row">
                <span class="store__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                    <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </span>
                <div><span class="store__label">Horario</span><span class="store__val">{{ s.hours }}</span></div>
              </li>
              <li class="store__row">
                <span class="store__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>
                </span>
                <div><span class="store__label">Teléfono</span><a class="store__val store__val--link" [href]="'tel:' + s.tel">{{ s.phone }}</a></div>
              </li>
              <li class="store__row">
                <span class="store__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
                    <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>
                </span>
                <div><span class="store__label">Email</span><a class="store__val store__val--link" [href]="'mailto:' + s.email">{{ s.email }}</a></div>
              </li>
            </ul>

            <div class="store__actions">
              <a class="btn btn--wa" [href]="s.whatsapp" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
                WhatsApp
              </a>
              <a class="btn btn--ghost" [href]="s.directions" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 11l18-8-8 18-2-8-8-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
                Cómo llegar
              </a>
            </div>
          </div>

          <div class="store__map">
            <iframe
              [src]="s.mapEmbed"
              title="Mapa de {{ s.name }}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </article>
      }
    </section>
  `,
  styleUrl: './tiendas.component.scss',
})
export class TiendasComponent {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly stores: Store[] = (
    [
      {
        name: 'Tienda Principal - Miraflores',
        address: 'Av. Larco 1234, Miraflores, Lima',
        hours: 'Lun - Sáb: 10:00 AM - 9:00 PM | Dom: 11:00 AM - 7:00 PM',
        phone: '+51 987 654 321',
        email: 'miraflores@ninetysix.com',
        whatsapp: 'https://wa.me/51987654321',
      },
      {
        name: 'Tienda San Isidro',
        address: 'Av. Conquistadores 567, San Isidro, Lima',
        hours: 'Lun - Sáb: 10:00 AM - 9:00 PM | Dom: 11:00 AM - 7:00 PM',
        phone: '+51 987 654 322',
        email: 'sanisidro@ninetysix.com',
        whatsapp: 'https://wa.me/51987654322',
      },
    ] satisfies StoreInput[]
  ).map((s) => this.buildStore(s));

  constructor() {
    this.seo.update({
      title: 'Nuestras Tiendas · Ninetysix',
      description:
        'Visita nuestras tiendas Ninetysix en Miraflores y San Isidro, Lima. Direcciones, horarios y cómo llegar.',
    });
  }

  private buildStore(s: StoreInput): Store {
    const q = encodeURIComponent(`${s.address}, Perú`);
    return {
      ...s,
      tel: s.phone.replace(/\s+/g, ''),
      directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      mapEmbed: this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${q}&output=embed`,
      ),
    };
  }
}
