import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '@services/seo.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { STORE_LOCATIONS, StoreLocation } from '../../shared/store.config';

interface LocationView extends StoreLocation {
  mapEmbed: SafeResourceUrl;
  mapLink: string;
}

/** Página "Ubicaciones": tiendas físicas con mapa embebido y datos de contacto. */
@Component({
  selector: 'app-tiendas',
  imports: [PageHeaderComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="+ Visítanos" title="Ubicaciones"
      subtitle="Visítanos en nuestras tiendas físicas y vive la experiencia NINETY SIX en persona." />

    <section class="lc">
      @for (s of locations; track s.name; let i = $index) {
        <article class="loc" appReveal [appRevealDelay]="i * 90">
          <div class="loc__map">
            <iframe
              [src]="s.mapEmbed"
              title="Mapa de {{ s.name }}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <span class="loc__tag">{{ s.tag }}</span>
          </div>

          <div class="loc__body">
            <h2 class="loc__name">{{ s.name }}</h2>

            <ul class="loc__rows">
              <li class="loc__row">
                <span class="loc__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.6" />
                    <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6" />
                  </svg>
                </span>
                <div><span class="loc__val">{{ s.address }}</span><span class="loc__muted">{{ s.area }}</span></div>
              </li>
              <li class="loc__row">
                <span class="loc__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                    <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </span>
                <div>
                  @for (h of s.hours; track h) {
                    <span class="loc__val">{{ h }}</span>
                  }
                </div>
              </li>
              <li class="loc__row">
                <span class="loc__ic">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>
                </span>
                <div><span class="loc__val">{{ s.phoneDisplay }}</span></div>
              </li>
            </ul>

            <a class="loc__btn" [href]="s.mapLink" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" stroke="currentColor" stroke-width="1.7" />
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.7" />
              </svg>
              Ver en Google Maps
            </a>
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

  readonly locations: LocationView[] = STORE_LOCATIONS.map((s) => {
    const q = encodeURIComponent(s.mapQuery);
    return {
      ...s,
      mapEmbed: this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${q}&output=embed`,
      ),
      mapLink: s.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${q}`,
    };
  });

  constructor() {
    this.seo.update({
      title: 'Ubicaciones · Ninetysix',
      description:
        'Visita nuestra tienda Ninetysix en Quito, Ecuador. Dirección, horarios, teléfono y mapa.',
    });
  }
}
