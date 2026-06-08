import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreCollection } from '@models/storefront.models';
import { CollectionCardComponent } from '../../../components/collection-card/collection-card.component';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/**
 * Sección de categorías de la portada: grid de tarjetas construidas a partir de
 * las categorías activas con imagen. Se oculta si no hay ninguna.
 */
@Component({
  selector: 'app-collections-section',
  imports: [CollectionCardComponent, RevealOnScrollDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (collections().length) {
      <section id="colecciones" class="cs">
        <header class="cs__head" appReveal>
          <div>
            <span class="cs__kicker">+ Explora</span>
            <h2 class="cs__title">Categorías</h2>
          </div>
          <a class="cs__all" routerLink="/catalogo">
            Ver catálogo
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </header>

        <div class="cs__grid">
          @for (col of collections(); track col.slug; let i = $index) {
            <div class="cs__item" appReveal [appRevealDelay]="(i % 3) * 90">
              <app-collection-card [collection]="col" />
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .cs {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(40px, 6vw, 72px) clamp(16px, 5vw, 44px);
      scroll-margin-top: 84px;
    }
    .cs__head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: clamp(28px, 4vw, 46px);
    }
    .cs__kicker {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
    .cs__title {
      margin: 12px 0 0;
      font-family: var(--st-font-display);
      font-size: clamp(2.2rem, 6vw, 3.6rem);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--st-text);
    }
    .cs__all {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 999px;
      border: 1px solid var(--st-line-strong);
      color: var(--st-text);
      font-size: 0.84rem;
      font-weight: 700;
      text-decoration: none;
      transition: gap 0.3s ease, border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
    }
    .cs__all svg {
      width: 17px;
      height: 17px;
    }
    .cs__all:hover {
      gap: 12px;
      border-color: var(--st-lime);
      color: var(--st-lime);
      background: rgb(198 255 62 / 8%);
    }
    .cs__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(12px, 2vw, 22px);
    }
    .cs__item { min-width: 0; }
    @media (min-width: 600px) {
      .cs__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 960px) {
      .cs__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
})
export class CollectionsSectionComponent {
  readonly collections = input.required<StoreCollection[]>();
}
