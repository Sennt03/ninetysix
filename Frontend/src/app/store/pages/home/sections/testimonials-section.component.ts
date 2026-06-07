import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '../../../components/section-heading/section-heading.component';
import { TestimonialCardComponent } from '../../../components/testimonial-card/testimonial-card.component';
import { RevealOnScrollDirective } from '../../../shared/reveal-on-scroll.directive';

interface Testimonial {
  quote: string;
  author: string;
}

/** Sección "Nuestros Clientes": testimonios (contenido de marca). */
@Component({
  selector: 'app-testimonials-section',
  imports: [SectionHeadingComponent, TestimonialCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="clientes" class="ts">
      <div class="ts__inner">
        <app-section-heading title="Nuestros Clientes" subtitle="Miles de clientes satisfechos" />

        <div class="ts__grid">
          @for (t of testimonials; track t.author; let i = $index) {
            <div appReveal [appRevealDelay]="i * 100">
              <app-testimonial-card [quote]="t.quote" [author]="t.author" />
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .ts {
      background: var(--st-cream);
    }
    .ts__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(54px, 8vw, 96px) clamp(16px, 5vw, 40px);
    }
    .ts__grid {
      margin-top: clamp(32px, 5vw, 52px);
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 2.4vw, 24px);
    }
    @media (min-width: 760px) {
      .ts__grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `,
})
export class TestimonialsSectionComponent {
  readonly testimonials: Testimonial[] = [
    { quote: 'Calidad excepcional', author: 'Carlos M.' },
    { quote: 'Mi marca favorita', author: 'Roberto S.' },
    { quote: 'Totalmente recomendado', author: 'Diego V.' },
  ];
}
