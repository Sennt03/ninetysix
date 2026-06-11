import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';
import { STORE_INSTAGRAM } from '../../../shared/store.config';

/**
 * Sección de Instagram: grid editorial con fotos reales de la marca. Cada imagen
 * enlaza a su publicación en Instagram; al pasar el cursor aparece un overlay
 * oscuro con un icono de cámara.
 */
@Component({
  selector: 'app-instagram-section',
  imports: [RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="instagram" class="ig">
      <div class="ig__inner">
        <header class="ig__head" appReveal>
          <h2 class="ig__title">Ya revisaste nuestro <span class="ig__title-hl">IG</span>?<br />Y estas las fotos</h2>
          <a class="ig__all" [href]="instagram" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            Ver Instagram
          </a>
        </header>

        <div class="ig__grid">
          @for (item of posts; track item.url; let i = $index) {
            <a
              class="ig__item"
              [href]="item.url"
              target="_blank"
              rel="noopener"
              appReveal
              [appRevealDelay]="(i % 3) * 80"
              [attr.aria-label]="'Ver en Instagram: ' + item.alt"
            >
              <img
                class="ig__img"
                [src]="item.img"
                [alt]="item.alt"
                loading="lazy"
                decoding="async"
              />
              <span class="ig__overlay" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 8a2 2 0 012-2h1l1-2h8l1 2h1a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                    stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                  <circle cx="12" cy="13" r="3.4" stroke="currentColor" stroke-width="1.6" />
                </svg>
              </span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .ig {
      background: var(--st-bg-2);
      border-top: 1px solid var(--st-line);
    }
    .ig__inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(56px, 8vw, 100px) clamp(16px, 5vw, 44px);
    }
    .ig__head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: clamp(28px, 4vw, 46px);
    }
    .ig__title {
      margin: 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.2rem, 6.5vw, 4rem);
      font-weight: 900;
      line-height: 0.98;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--st-text);
    }
    .ig__title-soft {
      color: transparent;
      -webkit-text-stroke: 1.5px var(--st-line-strong);
    }
    .ig__title-hl {
      color: var(--st-lime);
    }
    .ig__all {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 11px 20px;
      border-radius: 999px;
      border: 1px solid var(--st-line-strong);
      color: var(--st-text);
      font-size: 0.84rem;
      font-weight: 700;
      text-decoration: none;
      transition: border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
    }
    .ig__all svg {
      width: 18px;
      height: 18px;
    }
    .ig__all:hover {
      border-color: var(--st-lime);
      color: var(--st-lime);
      background: rgb(198 255 62 / 8%);
    }
    .ig__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(10px, 1.6vw, 18px);
    }
    @media (min-width: 720px) {
      .ig__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    .ig__item {
      position: relative;
      display: block;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: var(--st-radius);
      border: 1px solid var(--st-line);
      isolation: isolate;
    }
    .ig__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .ig__item:hover .ig__img {
      transform: scale(1.08);
    }
    .ig__overlay {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgb(10 11 10 / 0%);
      color: #fff;
      opacity: 0;
      transition: opacity 0.4s ease, background-color 0.4s ease;
    }
    .ig__overlay svg {
      width: 46px;
      height: 46px;
      transform: scale(0.8);
      transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.3s ease;
    }
    .ig__item:hover .ig__overlay {
      opacity: 1;
      background: rgb(10 11 10 / 58%);
    }
    .ig__item:hover .ig__overlay svg {
      transform: scale(1);
      color: var(--st-lime);
    }
  `,
})
export class InstagramSectionComponent {
  readonly instagram = STORE_INSTAGRAM;
  readonly posts = [
    {
      img: '/img/ig-1.jpeg',
      url: 'https://www.instagram.com/p/DZIVSkTkRke/?img_index=5&igsh=NG92ZGltdjV1Y2J6',
      alt: 'Look urbano Ninetysix',
    },
    {
      img: '/img/ig-2.png',
      url: 'https://www.instagram.com/p/DZD5yEiEVd8/?img_index=1&igsh=anZ5cnlvejdsd3Vl',
      alt: 'Conjunto streetwear Ninetysix',
    },
    {
      img: '/img/ig-3.png',
      url: 'https://www.instagram.com/reel/DY-tU2Rx8LN/?igsh=MWUyYWluNXFhbGlkZQ==',
      alt: 'Reel de estilo Ninetysix',
    },
    {
      img: '/img/ig-4.png',
      url: 'https://www.instagram.com/reel/DY8fNp-xZxS/?igsh=MTBtcWIxajE4bXpoMA==',
      alt: 'Reel de looks Ninetysix',
    },
    {
      img: '/img/ig-5.png',
      url: 'https://www.instagram.com/p/DYhgernkYYo/?img_index=3&igsh=cGt3OXd0amZ3dzZk',
      alt: 'Editorial de calle Ninetysix',
    },
  ];
}
