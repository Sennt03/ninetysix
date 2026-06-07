import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado de sección reutilizable: píldora opcional + título display + subtítulo.
 * El icono de la píldora se proyecta con `[sh-icon]`. Usado en "Productos
 * Destacados", "Nuestros Clientes", etc.
 */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sh">
      @if (pill()) {
        <span class="sh__pill"><ng-content select="[sh-icon]" />{{ pill() }}</span>
      }
      <h2 class="sh__title">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="sh__subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: `
    .sh {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      max-width: 620px;
      margin: 0 auto;
    }
    .sh__pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 16px;
      border-radius: 999px;
      background: var(--st-cream);
      color: var(--st-rose-deep);
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid var(--st-line);
    }
    .sh__pill svg {
      width: 15px;
      height: 15px;
    }
    .sh__title {
      margin: 0;
      font-family: var(--st-font-display);
      font-size: clamp(1.9rem, 4.5vw, 2.9rem);
      font-weight: 700;
      line-height: 1.08;
      color: var(--st-espresso);
      letter-spacing: -0.01em;
    }
    .sh__subtitle {
      margin: 0;
      color: var(--st-muted);
      font-size: clamp(0.98rem, 2vw, 1.08rem);
      line-height: 1.5;
    }
  `,
})
export class SectionHeadingComponent {
  readonly pill = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
