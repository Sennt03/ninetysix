import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HERO_IMAGE } from '../../shared/store.config';

/**
 * Hero reutilizable para páginas internas (Historia, Reseñas, Redes, Tiendas).
 * Imagen de marca de fondo con overlay cálido, píldora opcional, título y subtítulo.
 * Más bajo que el hero de la portada.
 */
@Component({
  selector: 'app-page-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ph">
      <div class="ph__bg" aria-hidden="true"></div>
      <span class="ph__overlay" aria-hidden="true"></span>
      <div class="ph__content">
        @if (pill()) {
          <span class="ph__pill"><ng-content select="[ph-icon]" />{{ pill() }}</span>
        }
        <h1 class="ph__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="ph__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .ph {
      position: relative;
      min-height: clamp(420px, 62vh, 600px);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      background: linear-gradient(160deg, #3a2a22, #2b1d18);
    }
    .ph__bg {
      position: absolute;
      inset: 0;
      background-image: var(--ph-image);
      background-size: cover;
      background-position: center 30%;
      animation: ph-zoom 16s ease-out forwards;
    }
    .ph__overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgb(36 26 22 / 62%) 0%, rgb(43 29 24 / 48%) 45%, rgb(36 26 22 / 80%) 100%),
        radial-gradient(120% 80% at 50% 35%, rgb(120 70 50 / 26%), transparent 70%);
    }
    .ph__content {
      position: relative;
      z-index: 1;
      padding: 96px 22px 40px;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .ph__pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 999px;
      background: rgb(255 255 255 / 14%);
      border: 1px solid rgb(255 255 255 / 24%);
      backdrop-filter: blur(6px);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.03em;
    }
    .ph__pill svg { width: 15px; height: 15px; }
    .ph__title {
      margin: 0;
      font-family: var(--st-font-display);
      font-weight: 700;
      font-size: clamp(2.4rem, 7vw, 4.2rem);
      line-height: 1.02;
      letter-spacing: -0.01em;
      text-shadow: 0 16px 46px rgb(0 0 0 / 35%);
    }
    .ph__subtitle {
      margin: 0;
      max-width: 36ch;
      font-size: clamp(1rem, 2.4vw, 1.2rem);
      color: rgb(255 255 255 / 88%);
    }
    @media (prefers-reduced-motion: no-preference) {
      .ph__pill, .ph__title, .ph__subtitle {
        opacity: 0;
        animation: ph-in 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }
      .ph__pill { animation-delay: 0.1s; }
      .ph__title { animation-delay: 0.24s; }
      .ph__subtitle { animation-delay: 0.4s; }
    }
    @keyframes ph-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
    @keyframes ph-zoom { from { transform: scale(1.1); } to { transform: scale(1); } }
  `,
  host: {
    '[style.--ph-image]': 'bgImage',
  },
})
export class PageHeroComponent {
  readonly pill = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);

  readonly bgImage = `url("${HERO_IMAGE}")`;
}
