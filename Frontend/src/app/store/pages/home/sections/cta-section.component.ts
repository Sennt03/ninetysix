import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/** Banner editorial "Ninety Six Essentials" con imagen de marca y CTA neón. */
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="esenciales" class="cta">
      <div class="cta__banner" appReveal>
        <img
          class="cta__img"
          src="https://picsum.photos/seed/ninetysix-essentials/1400/900"
          alt="Colección esencial Ninetysix"
          loading="lazy"
          decoding="async"
        />
        <span class="cta__shade" aria-hidden="true"></span>

        <div class="cta__content">
          <span class="cta__kicker">+ Colección esencial</span>
          <h2 class="cta__title">
            Ninety<br />Six <span class="cta__title-soft">Essentials</span>
          </h2>
          <p class="cta__subtitle">Minimalismo urbano. Máximo impacto.</p>
          <a class="cta__btn" routerLink="/catalogo">
            Ver colección
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cta {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(40px, 6vw, 72px) clamp(16px, 5vw, 44px);
    }
    .cta__banner {
      position: relative;
      overflow: hidden;
      border-radius: var(--st-radius-xl);
      border: 1px solid var(--st-line);
      min-height: clamp(380px, 52vw, 540px);
      display: flex;
      align-items: center;
      isolation: isolate;
    }
    .cta__img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
      transition: transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .cta__banner:hover .cta__img {
      transform: scale(1.05);
    }
    .cta__shade {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgb(10 11 10 / 92%) 0%, rgb(10 11 10 / 55%) 50%, rgb(10 11 10 / 15%) 100%),
        radial-gradient(80% 100% at 0% 50%, rgb(198 255 62 / 12%), transparent 60%);
    }
    .cta__content {
      position: relative;
      z-index: 1;
      padding: clamp(28px, 5vw, 60px);
      max-width: 620px;
    }
    .cta__kicker {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
    .cta__title {
      margin: 16px 0 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.6rem, 8vw, 5rem);
      font-weight: 900;
      line-height: 0.92;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: #fff;
    }
    .cta__title-soft {
      color: transparent;
      -webkit-text-stroke: 1.5px rgb(255 255 255 / 40%);
    }
    .cta__subtitle {
      margin: 20px 0 0;
      font-size: clamp(1rem, 2.4vw, 1.2rem);
      color: rgb(255 255 255 / 82%);
    }
    .cta__btn {
      margin-top: 28px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 15px 30px;
      border-radius: 999px;
      background: var(--st-lime);
      color: var(--st-lime-ink);
      font-weight: 700;
      font-size: 0.94rem;
      text-decoration: none;
      box-shadow: 0 18px 44px -16px var(--st-lime-glow);
      transition: transform 0.3s ease, gap 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
    }
    .cta__btn svg {
      width: 18px;
      height: 18px;
    }
    .cta__btn:hover {
      transform: translateY(-3px);
      gap: 14px;
      filter: brightness(1.05);
      box-shadow: 0 24px 54px -16px var(--st-lime-glow);
    }
  `,
})
export class CtaSectionComponent {}
