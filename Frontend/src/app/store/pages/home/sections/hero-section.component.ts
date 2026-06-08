import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Hero de la portada (streetwear dark). Columna de marca/claim + CTAs + métricas
 * a la izquierda, y una tarjeta-escaparate flotante a la derecha. Las imágenes del
 * escaparate son de marca (placeholder por ahora); el catálogo es dinámico aparte.
 */
@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <span class="hero__grid" aria-hidden="true"></span>
      <span class="hero__glow" aria-hidden="true"></span>
      <span class="hero__glow hero__glow--2" aria-hidden="true"></span>

      <div class="hero__inner">
        <div class="hero__copy">
          <span class="hero__pill">
            <span class="hero__pill-dot" aria-hidden="true"></span>
            Nueva Drop · SS26
          </span>

          <h1 class="hero__title">
            STREET<br />WEAR <span class="hero__hl">WITHOUT</span><br />LIMITS
          </h1>

          <p class="hero__lead">
            Diseño urbano premium en cada prenda. Ediciones limitadas, calidad real
            y actitud sin límites.
          </p>

          <div class="hero__actions">
            <a class="hbtn hbtn--lime" routerLink="/catalogo">
              Explorar ahora
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
            <a class="hbtn hbtn--ghost" routerLink="/historia">Nuestra historia</a>
          </div>

          <dl class="hero__stats">
            <div class="hero__stat">
              <dt>100+</dt>
              <dd>Drops lanzados</dd>
            </div>
            <div class="hero__stat">
              <dt>152K</dt>
              <dd>Comunidad</dd>
            </div>
            <div class="hero__stat">
              <dt>100%</dt>
              <dd>Original</dd>
            </div>
          </dl>
        </div>

        <div class="hero__showcase">
          <div class="hero__card">
            <img
              class="hero__photo"
              src="https://picsum.photos/seed/ninetysix-hero/760/940"
              alt="Look streetwear Ninetysix de la nueva temporada"
              loading="eager"
              decoding="async"
            />
            <span class="hero__shade" aria-hidden="true"></span>

            <span class="hero__chip hero__chip--top">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l2.5 5.3 5.5.8-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.5-.8L12 3z"
                  fill="currentColor" />
              </svg>
              4.9 · +2K reseñas
            </span>

            <span class="hero__chip hero__chip--mid">Envío gratis a todo el país</span>

            <div class="hero__drop">
              <div class="hero__drop-info">
                <span class="hero__drop-tag">New Drop 2026</span>
                <span class="hero__drop-name">Oversized Tech Jacket</span>
              </div>
              <a class="hero__drop-btn" routerLink="/catalogo" aria-label="Ver el catálogo">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {}
