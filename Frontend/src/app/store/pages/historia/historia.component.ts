import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '@services/seo.service';
import { SectionHeadingComponent } from '../../components/section-heading/section-heading.component';
import { PageHeroComponent } from '../../components/page-hero/page-hero.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

interface Milestone {
  year: string;
  icon: string;
  title: string;
  text: string;
}

interface Value {
  title: string;
  text: string;
  icon: 'quality' | 'passion' | 'excellence';
}

/** Página "Nuestra Historia": hero, intro, trayectoria (zig-zag), misión/visión y valores. */
@Component({
  selector: 'app-historia',
  imports: [PageHeroComponent, SectionHeadingComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Nuestra Historia"
      subtitle="Más de dos décadas vistiendo al hombre moderno"
    />

    <!-- Intro -->
    <section class="intro">
      <div class="intro__inner" appReveal>
        <p>
          Ninetysix nació en 2005 con una visión clara: ofrecer al hombre moderno prendas que combinen
          elegancia, calidad y funcionalidad. Desde nuestros inicios, nos hemos comprometido a crear
          piezas atemporales que reflejen sofisticación y estilo.
        </p>
        <p>
          A lo largo de los años, hemos evolucionado junto con nuestros clientes, adaptándonos a las
          nuevas tendencias sin perder nuestra esencia: la búsqueda incansable de la excelencia en
          cada detalle.
        </p>
      </div>
    </section>

    <!-- Trayectoria (zig-zag) -->
    <section class="tl">
      <h2 class="tl__title">Nuestra Trayectoria</h2>
      <div class="tl__items">
        @for (m of milestones; track m.year; let i = $index) {
          <div class="tl__item" [class.tl__item--alt]="i % 2 === 1" appReveal [appRevealDelay]="i * 60">
            <span class="tl__year">{{ m.year }}</span>
            <div class="tl__node"><span>{{ m.icon }}</span></div>
            <div class="tl__card">
              <h3>{{ m.title }}</h3>
              <p>{{ m.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Misión / Visión -->
    <section class="mv">
      <div class="mv__inner">
        <article class="mv__card" appReveal>
          <header class="mv__head">
            <span class="mv__ic">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6" />
                <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              </svg>
            </span>
            <h3>Misión</h3>
          </header>
          <p>
            Proporcionar al hombre moderno prendas de alta calidad que reflejen elegancia, confianza y
            estilo, utilizando los mejores materiales y procesos de confección.
          </p>
        </article>

        <article class="mv__card" appReveal [appRevealDelay]="100">
          <header class="mv__head">
            <span class="mv__ic">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.6" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" />
              </svg>
            </span>
            <h3>Visión</h3>
          </header>
          <p>
            Ser la marca líder en moda masculina premium, reconocida por nuestra calidad excepcional,
            diseño atemporal y compromiso con la satisfacción del cliente.
          </p>
        </article>
      </div>
    </section>

    <!-- Valores -->
    <section class="vl">
      <div class="vl__inner">
        <app-section-heading title="Nuestros Valores" />
        <div class="vl__grid">
          @for (v of values; track v.title; let i = $index) {
            <article class="vl__card" appReveal [appRevealDelay]="i * 90">
              <span class="vl__ic">
                @switch (v.icon) {
                  @case ('quality') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                      <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  }
                  @case ('passion') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.4-7 10-7 10z"
                        stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                    </svg>
                  }
                  @case ('excellence') {
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6" />
                      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                    </svg>
                  }
                }
              </span>
              <h3>{{ v.title }}</h3>
              <p>{{ v.text }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './historia.component.scss',
})
export class HistoriaComponent {
  private readonly seo = inject(SeoService);

  readonly milestones: Milestone[] = [
    { year: '2005', icon: '🚀', title: 'Fundación', text: 'Nace Ninetysix con la visión de revolucionar la moda masculina' },
    { year: '2010', icon: '🏢', title: 'Primera Tienda', text: 'Apertura de nuestra primera tienda física en Lima' },
    { year: '2015', icon: '📈', title: 'Expansión', text: 'Expandimos nuestra presencia a nivel nacional' },
    { year: '2020', icon: '💻', title: 'Presencia Digital', text: 'Lanzamiento de nuestra plataforma de comercio electrónico' },
    { year: '2025', icon: '👑', title: 'Consolidación', text: 'Consolidación como referente en moda masculina premium' },
  ];

  readonly values: Value[] = [
    { title: 'Calidad', text: 'Seleccionamos los mejores materiales para garantizar prendas duraderas', icon: 'quality' },
    { title: 'Pasión', text: 'Amor por la moda y dedicación en cada detalle', icon: 'passion' },
    { title: 'Excelencia', text: 'Compromiso con la perfección en cada prenda', icon: 'excellence' },
  ];

  constructor() {
    this.seo.update({
      title: 'Nuestra Historia · Ninetysix',
      description:
        'La historia de Ninetysix: más de dos décadas creando moda masculina premium. Conoce nuestra trayectoria, misión, visión y valores.',
    });
  }
}
