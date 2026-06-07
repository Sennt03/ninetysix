import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_IMAGE } from '../../../shared/store.config';

/**
 * Hero a pantalla completa de la portada. Imagen de marca fija (seleccionada),
 * con overlay cálido. El contenido (marca, claim, CTAs) es estático de marca.
 */
@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero__bg" [style.background-image]="bgImage" aria-hidden="true"></div>
      <span class="hero__overlay" aria-hidden="true"></span>

      <div class="hero__content">
        <span class="hero__badge">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3L12 3z" fill="currentColor" />
          </svg>
          Nueva Temporada 2026
        </span>
        <h1 class="hero__brand">Ninetysix</h1>
        <p class="hero__tagline">Elegancia, confianza y estilo para el hombre moderno</p>

        <div class="hero__actions">
          <a class="hbtn hbtn--cream" routerLink="/" fragment="destacados">
            Ver Catálogo
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <a class="hbtn hbtn--ghost" routerLink="/historia">Nuestra Historia</a>
        </div>
      </div>

      <a class="hero__scroll" routerLink="/" fragment="colecciones" aria-label="Ver más">
        <span class="hero__mouse"><span class="hero__wheel"></span></span>
      </a>
    </section>
  `,
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  readonly bgImage = `url("${HERO_IMAGE}")`;
}
