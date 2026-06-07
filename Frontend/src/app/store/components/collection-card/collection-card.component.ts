import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreCollection } from '@models/storefront.models';

/**
 * Tarjeta editorial de colección/categoría: imagen de fondo con degradado, título
 * y subtítulo (portada) o píldora con nº de productos (catálogo). Enlaza a la PLP.
 * Si la categoría no tiene imagen, muestra un placeholder con su inicial.
 */
@Component({
  selector: 'app-collection-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="cc" [routerLink]="['/categoria', collection().slug]">
      @if (collection().imageUrl) {
        <img
          class="cc__img"
          [src]="collection().imageUrl"
          [alt]="collection().imageAlt || collection().name"
          loading="lazy"
          decoding="async"
        />
      } @else {
        <div class="cc__img cc__img--placeholder" aria-hidden="true">
          <span class="cc__initial">{{ initial() }}</span>
        </div>
      }
      <span class="cc__overlay" aria-hidden="true"></span>

      @if (countPill()) {
        <span class="cc__pill">{{ countLabel() }}</span>
      }

      <div class="cc__content">
        <h3 class="cc__title">{{ collection().name }}</h3>
        @if (!countPill()) {
          <p class="cc__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </a>
  `,
  styles: `
    .cc {
      position: relative;
      display: block;
      overflow: hidden;
      border-radius: var(--st-radius-lg);
      min-height: clamp(220px, 38vw, 340px);
      text-decoration: none;
      box-shadow: var(--st-shadow);
      isolation: isolate;
    }
    .cc__img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .cc__img--placeholder {
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--st-taupe), var(--st-espresso));
    }
    .cc__initial {
      font-family: var(--st-font-display);
      font-size: clamp(3rem, 10vw, 6rem);
      font-weight: 700;
      color: rgb(255 255 255 / 22%);
    }
    .cc:hover .cc__img {
      transform: scale(1.07);
    }
    .cc__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgb(36 26 22 / 12%) 0%, rgb(36 26 22 / 72%) 100%);
    }
    .cc__pill {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 1;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgb(255 255 255 / 90%);
      color: var(--st-espresso);
      font-size: 0.76rem;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .cc__content {
      position: absolute;
      left: 0;
      bottom: 0;
      padding: clamp(20px, 3vw, 34px);
      color: #fff;
      z-index: 1;
    }
    .cc__title {
      margin: 0 0 4px;
      font-family: var(--st-font-display);
      font-size: clamp(1.4rem, 3vw, 2rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .cc__subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: rgb(255 255 255 / 82%);
      max-width: 38ch;
    }
  `,
})
export class CollectionCardComponent {
  readonly collection = input.required<StoreCollection>();
  /** En modo catálogo: muestra píldora con nº de productos y oculta el subtítulo. */
  readonly countPill = input(false);

  readonly initial = computed(() => this.collection().name.charAt(0).toUpperCase());

  readonly countLabel = computed(() => {
    const n = this.collection().productCount;
    if (n <= 0) {
      return 'Ver categoría';
    }
    return `${n} ${n === 1 ? 'producto' : 'productos'}`;
  });

  readonly subtitle = computed(() => {
    const c = this.collection();
    if (c.description) {
      return c.description.length > 90 ? `${c.description.slice(0, 90).trim()}…` : c.description;
    }
    const n = c.productCount;
    return n > 0 ? `${n} ${n === 1 ? 'pieza disponible' : 'piezas disponibles'}` : 'Descubre la colección';
  });
}
