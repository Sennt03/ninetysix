import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { SeoService } from '@services/seo.service';
import { SectionHeadingComponent } from '../../components/section-heading/section-heading.component';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

interface Review {
  name: string;
  location: string;
  product: string;
  text: string;
}

const AUTOPLAY_MS = 6000;

/** Página "Reseñas": hero, carrusel de testimonios destacado y grid de opiniones. */
@Component({
  selector: 'app-resenas',
  imports: [PageHeroComponent, SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero pill="5.0 de 5 estrellas" title="Testimonios"
      subtitle="Lo que dicen nuestros clientes satisfechos">
      <svg ph-icon viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" fill="currentColor" />
      </svg>
    </app-page-hero>

    <!-- Carrusel destacado -->
    <section class="rev">
      <div
        class="rev__featured"
        appReveal
        (mouseenter)="pause()"
        (mouseleave)="resume()"
      >
        <span class="rev__quotemark" aria-hidden="true">”</span>

        @if (current(); as r) {
          <div class="rev__avatar" aria-hidden="true">{{ initials(r.name) }}</div>
          <div class="rev__stars" aria-label="5 de 5 estrellas">
            @for (s of stars; track $index) {
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" fill="currentColor" /></svg>
            }
          </div>
          <blockquote class="rev__quote">“{{ r.text }}”</blockquote>
          <p class="rev__name">{{ r.name }}</p>
          <p class="rev__loc">{{ r.location }}</p>
          <p class="rev__bought">Compró: {{ r.product }}</p>
        }

        <button type="button" class="rev__nav rev__nav--prev" (click)="prev()" aria-label="Anterior">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" class="rev__nav rev__nav--next" (click)="next()" aria-label="Siguiente">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>

        <div class="rev__dots">
          @for (r of reviews; track r.name; let i = $index) {
            <button type="button" class="rev__dot" [class.is-active]="i === active()"
              (click)="go(i)" [attr.aria-label]="'Ir a la reseña ' + (i + 1)"></button>
          }
        </div>
      </div>
    </section>

    <!-- Más opiniones -->
    <section class="more">
      <div class="more__inner">
        <app-section-heading title="Más Opiniones" />
        <div class="more__grid">
          @for (r of reviews; track r.name; let i = $index) {
            <article class="rcard" appReveal [appRevealDelay]="(i % 3) * 80">
              <header class="rcard__head">
                <span class="rcard__avatar" aria-hidden="true">{{ initials(r.name) }}</span>
                <div>
                  <p class="rcard__name">{{ r.name }}</p>
                  <p class="rcard__loc">{{ r.location }}</p>
                </div>
              </header>
              <div class="rcard__stars" aria-label="5 de 5 estrellas">
                @for (s of stars; track $index) {
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" fill="currentColor" /></svg>
                }
              </div>
              <p class="rcard__text">“{{ r.text }}”</p>
              <p class="rcard__bought">{{ r.product }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './resenas.component.scss',
})
export class ResenasComponent {
  private readonly seo = inject(SeoService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);

  readonly stars = Array.from({ length: 5 });

  readonly reviews: Review[] = [
    { name: 'Carlos Mendoza', location: 'Quito', product: 'Oversized Tech Jacket', text: 'La calidad de las prendas es excepcional. Cada pieza que he comprado ha superado mis expectativas. La atención al detalle y los acabados son de primer nivel.' },
    { name: 'Roberto Silva', location: 'Cumbayá', product: 'Hoodie Premium', text: 'Estilo y confort en cada prenda. Mi marca favorita de streetwear. Los diseños son únicos y la calidad inigualable.' },
    { name: 'Diego Vargas', location: 'La Carolina', product: 'Conjunto Urbano', text: 'Atención personalizada y productos de primera. El equipo realmente se preocupa por encontrar las prendas perfectas para cada ocasión.' },
    { name: 'Andrés Torres', location: 'Tumbaco', product: 'Puffer Jacket', text: 'Desde que descubrí Ninetysix no compro en otro lugar. Calidad premium y un servicio impecable de principio a fin.' },
    { name: 'Javier Ríos', location: 'La Floresta', product: 'Hoodie Premium', text: 'Cortes perfectos y telas de primera. Recibo cumplidos cada vez que uso sus prendas. Totalmente recomendado.' },
    { name: 'Martín Castro', location: 'Los Chillos', product: 'Oversized Tech Jacket', text: 'Calidad y estilo en cada compra. La experiencia Ninetysix es de otro nivel.' },
  ];

  readonly active = signal(0);
  private readonly paused = signal(false);

  readonly current = computed(() => this.reviews[this.active()]);

  constructor() {
    this.seo.update({
      title: 'Reseñas · Ninetysix',
      description:
        'Testimonios y opiniones reales de los clientes de Ninetysix sobre nuestro streetwear premium.',
    });

    afterNextRender(() => {
      const id = setInterval(() => {
        if (!this.paused()) {
          this.next();
        }
      }, AUTOPLAY_MS);
      this.destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  prev(): void {
    this.active.update((i) => (i - 1 + this.reviews.length) % this.reviews.length);
  }
  next(): void {
    this.active.update((i) => (i + 1) % this.reviews.length);
  }
  go(i: number): void {
    this.active.set(i);
  }
  pause(): void {
    if (this.isBrowser) this.paused.set(true);
  }
  resume(): void {
    if (this.isBrowser) this.paused.set(false);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}
