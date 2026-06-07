import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/** Banda de llamada a la acción "Nueva Temporada" con degradado rose-gold. */
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta">
      <span class="cta__glow" aria-hidden="true"></span>
      <div class="cta__content" appReveal>
        <h2 class="cta__title">Nueva Temporada</h2>
        <p class="cta__subtitle">Descubre las últimas tendencias en moda masculina</p>
        <a class="cta__btn" routerLink="/" fragment="destacados">
          Explorar Colección
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  `,
  styles: `
    .cta {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(110% 120% at 80% 10%, #c8a896 0%, transparent 55%),
        linear-gradient(120deg, #7a574a 0%, #a3826f 50%, #5d4036 100%);
      color: #fff;
      text-align: center;
    }
    .cta__glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(60% 80% at 20% 90%, rgb(255 240 230 / 22%), transparent 60%);
    }
    .cta__content {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
      padding: clamp(60px, 9vw, 110px) clamp(20px, 5vw, 40px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .cta__title {
      margin: 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.1rem, 5vw, 3.3rem);
      font-weight: 700;
      letter-spacing: -0.01em;
      text-shadow: 0 14px 40px rgb(0 0 0 / 25%);
    }
    .cta__subtitle {
      margin: 0;
      font-size: clamp(1rem, 2.4vw, 1.2rem);
      color: rgb(255 255 255 / 90%);
    }
    .cta__btn {
      margin-top: 16px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 34px;
      border-radius: 999px;
      background: var(--st-cream);
      color: var(--st-espresso);
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 18px 46px -18px rgb(0 0 0 / 55%);
      transition: transform 0.3s ease, gap 0.3s ease, background-color 0.3s ease;
    }
    .cta__btn svg {
      width: 19px;
      height: 19px;
    }
    .cta__btn:hover {
      background: #fff;
      transform: translateY(-2px);
      gap: 14px;
    }
  `,
})
export class CtaSectionComponent {}
