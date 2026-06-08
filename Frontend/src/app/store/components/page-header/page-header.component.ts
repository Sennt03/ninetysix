import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado de página interna (streetwear dark): kicker en lima, título display
 * gigante en mayúsculas (con segunda palabra opcional en contorno) y subtítulo.
 * Sin imagen de fondo; deja aire bajo la cabecera fija.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ph2">
      <div class="ph2__inner">
        <span class="ph2__kicker">{{ kicker() }}</span>
        <h1 class="ph2__title">
          {{ title() }}@if (titleSoft()) {<span class="ph2__soft"> {{ titleSoft() }}</span>}
        </h1>
        @if (subtitle()) {
          <p class="ph2__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </header>
  `,
  styles: `
    :host { display: block; }
    .ph2 {
      padding: clamp(110px, 16vh, 170px) clamp(16px, 5vw, 44px) clamp(20px, 4vw, 40px);
    }
    .ph2__inner {
      max-width: 1280px;
      margin: 0 auto;
    }
    .ph2__kicker {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
    .ph2__title {
      margin: 14px 0 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.8rem, 9vw, 6rem);
      font-weight: 900;
      line-height: 0.92;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--st-text);
    }
    .ph2__soft {
      color: transparent;
      -webkit-text-stroke: 1.5px var(--st-line-strong);
    }
    .ph2__subtitle {
      margin: 22px 0 0;
      max-width: 52ch;
      font-size: clamp(1rem, 2.2vw, 1.15rem);
      line-height: 1.6;
      color: var(--st-muted);
    }
    @media (prefers-reduced-motion: no-preference) {
      .ph2__kicker, .ph2__title, .ph2__subtitle {
        opacity: 0;
        animation: ph2-in 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      }
      .ph2__kicker { animation-delay: 0.05s; }
      .ph2__title { animation-delay: 0.16s; }
      .ph2__subtitle { animation-delay: 0.3s; }
    }
    @keyframes ph2-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
  `,
})
export class PageHeaderComponent {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  /** Segunda palabra opcional, renderizada en contorno. */
  readonly titleSoft = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
}
