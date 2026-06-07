import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StoreCollection } from '@models/storefront.models';
import { CollectionCardComponent } from '../../../components/collection-card/collection-card.component';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

/**
 * Sección de colecciones de la portada: tarjetas editoriales construidas a partir
 * de las categorías activas con imagen. Se oculta si no hay ninguna.
 */
@Component({
  selector: 'app-collections-section',
  imports: [CollectionCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (collections().length) {
      <section id="colecciones" class="cs">
        <div class="cs__grid">
          @for (col of collections(); track col.slug; let i = $index) {
            <div class="cs__item" appReveal [appRevealDelay]="i * 90">
              <app-collection-card [collection]="col" />
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .cs {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(56px, 9vw, 110px) clamp(16px, 5vw, 40px) clamp(20px, 4vw, 40px);
      scroll-margin-top: 84px;
    }
    .cs__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 2.5vw, 26px);
    }
    .cs__item {
      display: block;
    }
    @media (min-width: 760px) {
      .cs__grid {
        grid-template-columns: repeat(2, 1fr);
      }
      /* Si hay un número impar, la última ocupa todo el ancho (look editorial). */
      .cs__item:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class CollectionsSectionComponent {
  readonly collections = input.required<StoreCollection[]>();
}
