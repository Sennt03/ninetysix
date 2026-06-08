import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { STORE_SOCIALS } from '../../shared/store.config';

/** Página "Redes": tarjetas de redes sociales con acento por plataforma. */
@Component({
  selector: 'app-redes',
  imports: [PageHeaderComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header kicker="— Síguenos" title="Follow the" titleSoft="Movement"
      subtitle="Únete a la comunidad NINETY SIX. Sé el primero en conocer cada drop." />

    <section class="rd">
      <div class="rd__grid">
        @for (s of socials; track s.name; let i = $index) {
          <a class="sc" [attr.data-net]="s.icon" [href]="s.url" target="_blank" rel="noopener"
            appReveal [appRevealDelay]="(i % 2) * 90">
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
            <h3 class="sc__name">{{ s.name }}</h3>
            <span class="sc__handle">{{ s.handle }}</span>
            <p class="sc__desc">{{ s.desc }}</p>
            <span class="sc__cta">{{ s.cta }} <span aria-hidden="true">→</span></span>
          </a>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .rd {
      max-width: 1040px;
      margin: 0 auto;
      padding: clamp(8px, 2vw, 24px) clamp(16px, 5vw, 44px) clamp(64px, 9vw, 110px);
    }
    .rd__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(14px, 2vw, 22px);
    }
    .sc {
      display: block;
      padding: clamp(22px, 3vw, 30px);
      border-radius: var(--st-radius-xl);
      background: var(--st-surface);
      border: 1px solid var(--st-line);
      text-decoration: none;
      transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease;
    }
    .sc:hover {
      transform: translateY(-6px);
      border-color: var(--net, var(--st-lime));
      box-shadow: 0 30px 60px -34px rgb(0 0 0 / 80%);
    }
    .sc__tile {
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--net, var(--st-lime)) 16%, transparent);
      color: var(--net, var(--st-lime));
      transition: transform 0.35s ease;
    }
    .sc:hover .sc__tile { transform: scale(1.08) rotate(-4deg); }
    .sc__tile svg { width: 26px; height: 26px; }
    .sc__name {
      margin: 18px 0 0;
      font-family: var(--st-font-display);
      font-size: 1.3rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--st-text);
    }
    .sc__handle {
      display: block;
      margin-top: 4px;
      font-size: 0.86rem;
      color: var(--st-faint);
    }
    .sc__desc {
      margin: 14px 0 0;
      color: var(--st-muted);
      line-height: 1.55;
      font-size: 0.95rem;
    }
    .sc__cta {
      display: inline-block;
      margin-top: 18px;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--net, var(--st-lime));
      transition: letter-spacing 0.3s ease;
    }
    .sc:hover .sc__cta { letter-spacing: 0.12em; }

    .sc[data-net='instagram'] { --net: #ff4d8d; }
    .sc[data-net='tiktok'] { --net: #e7e9e4; }
    .sc[data-net='facebook'] { --net: #4d8dff; }
    .sc[data-net='whatsapp'] { --net: #25d366; }

    @media (min-width: 720px) {
      .rd__grid { grid-template-columns: 1fr 1fr; }
    }
  `,
})
export class RedesComponent {
  private readonly seo = inject(SeoService);

  readonly socials = STORE_SOCIALS;

  constructor() {
    this.seo.update({
      title: 'Redes · Ninetysix',
      description: 'Síguenos en Instagram, TikTok, Facebook y WhatsApp. Únete a la comunidad NINETY SIX.',
    });
  }
}
