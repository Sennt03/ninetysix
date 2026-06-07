import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

type SocialIcon = 'instagram' | 'tiktok' | 'facebook' | 'whatsapp';

interface Social {
  name: string;
  handle: string;
  badge: string;
  desc: string;
  url: string;
  cta: string;
  icon: SocialIcon;
}

/** Página "Redes Sociales": hero, tarjetas de redes y llamada a etiquetar. */
@Component({
  selector: 'app-redes',
  imports: [PageHeroComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero pill="Síguenos" title="Redes Sociales"
      subtitle="Únete a nuestra comunidad y forma parte de Ninetysix">
      <svg ph-icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      </svg>
    </app-page-hero>

    <section class="rd">
      <div class="rd__grid">
        @for (s of socials; track s.name; let i = $index) {
          <a class="sc" [attr.data-net]="s.icon" [href]="s.url" target="_blank" rel="noopener"
            appReveal [appRevealDelay]="(i % 2) * 90">
            <div class="sc__top">
              <span class="sc__tile">
                @switch (s.icon) {
                  @case ('instagram') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7" />
                      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                    </svg>
                  }
                  @case ('tiktok') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M16 3c.3 2.2 1.8 3.9 4 4.2v3c-1.5 0-2.9-.5-4-1.3V15a6 6 0 11-6-6c.34 0 .67.03 1 .09v3.04A3 3 0 1013 15V3h3z" fill="currentColor" />
                    </svg>
                  }
                  @case ('facebook') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 9V7c0-1 .5-1.5 1.5-1.5H17V2.5h-2.5C12 2.5 10.5 4 10.5 6.8V9H8.5v3h2v9.5h3.5V12H17l.5-3H14z" fill="currentColor" />
                    </svg>
                  }
                  @case ('whatsapp') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                      <path d="M9 8.5c.2 2.5 2 4.3 4.5 4.5.6 0 1.2-.6 1.2-1.2l-1.6-.8-.8.8a4 4 0 01-1.6-1.6l.8-.8-.8-1.6c-.6 0-1.3.6-1.3 1.2z" fill="currentColor" />
                    </svg>
                  }
                }
              </span>
              <div class="sc__id">
                <h3 class="sc__name">{{ s.name }}</h3>
                <span class="sc__handle">{{ s.handle }}</span>
                <span class="sc__badge">{{ s.badge }}</span>
              </div>
            </div>
            <p class="sc__desc">{{ s.desc }}</p>
            <span class="sc__cta">{{ s.cta }} <span aria-hidden="true">→</span></span>
          </a>
        }
      </div>

      <div class="tag" appReveal>
        <h2 class="tag__title">Etiquétanos en tus fotos</h2>
        <p class="tag__sub">Comparte tu estilo Ninetysix y podrías aparecer en nuestras redes sociales</p>
        <div class="tag__chips">
          @for (h of hashtags; track h) {
            <span class="tag__chip">{{ h }}</span>
          }
        </div>
        <p class="tag__hint">Usa cualquiera de estos hashtags para que podamos encontrarte</p>
      </div>
    </section>
  `,
  styleUrl: './redes.component.scss',
})
export class RedesComponent {
  private readonly seo = inject(SeoService);

  readonly socials: Social[] = [
    { name: 'Instagram', handle: '@ninetysix', badge: '45.2K', desc: 'Sigue nuestras últimas colecciones, looks del día y contenido exclusivo', url: 'https://instagram.com/ninetysix', cta: 'Visitar perfil', icon: 'instagram' },
    { name: 'TikTok', handle: '@ninetysix', badge: '28.5K', desc: 'Videos de moda, tips de estilo y tendencias', url: 'https://tiktok.com/@ninetysix', cta: 'Visitar perfil', icon: 'tiktok' },
    { name: 'Facebook', handle: 'Ninetysix', badge: '32.8K', desc: 'Únete a nuestra comunidad y mantente al día con nuestras novedades', url: 'https://facebook.com', cta: 'Visitar perfil', icon: 'facebook' },
    { name: 'WhatsApp', handle: '+51 987 654 321', badge: 'Chat directo', desc: 'Contáctanos directamente para consultas y pedidos personalizados', url: 'https://wa.me/51987654321', cta: 'Abrir chat', icon: 'whatsapp' },
  ];

  readonly hashtags = ['#NinetysixStyle', '#ModaMasculina', '#EstiloNinetysix', '#EleganciaModerna'];

  constructor() {
    this.seo.update({
      title: 'Redes Sociales · Ninetysix',
      description:
        'Síguenos en Instagram, TikTok, Facebook y WhatsApp. Únete a la comunidad Ninetysix de moda masculina.',
    });
  }
}
