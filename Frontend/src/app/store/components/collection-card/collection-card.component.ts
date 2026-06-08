import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreCollection } from '@models/storefront.models';

/**
 * Tarjeta de categoría (streetwear dark): imagen de fondo con degradado, nombre en
 * la esquina inferior y un botón-flecha en la esquina superior derecha para ir a la
 * categoría completa. En modo catálogo muestra el nº de productos.
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

      <span class="cc__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <div class="cc__content">
        <h3 class="cc__title">{{ collection().name }}</h3>
        <span class="cc__meta">{{ metaLabel() }}</span>
      </div>
    </a>
  `,
  styles: `
    .cc {
      position: relative;
      display: block;
      min-width: 0;
      overflow: hidden;
      border-radius: var(--st-radius-lg);
      min-height: clamp(220px, 34vw, 320px);
      height: 100%;
      text-decoration: none;
      border: 1px solid var(--st-line);
      isolation: isolate;
      transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
        box-shadow 0.4s ease, border-color 0.4s ease;
    }
    .cc:hover {
      transform: translateY(-6px);
      border-color: rgb(198 255 62 / 35%);
      box-shadow: var(--st-shadow), var(--st-shadow-lime);
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
      background: linear-gradient(135deg, var(--st-surface-2), var(--st-elev));
    }
    .cc__initial {
      font-family: var(--st-font-display);
      font-size: clamp(3rem, 10vw, 6rem);
      font-weight: 900;
      color: rgb(255 255 255 / 14%);
    }
    .cc:hover .cc__img {
      transform: scale(1.08);
    }
    .cc__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgb(10 11 10 / 10%) 0%, rgb(10 11 10 / 25%) 45%, rgb(10 11 10 / 88%) 100%);
      transition: background 0.4s ease;
    }
    .cc:hover .cc__overlay {
      background: linear-gradient(180deg, rgb(10 11 10 / 25%) 0%, rgb(10 11 10 / 45%) 45%, rgb(10 11 10 / 92%) 100%);
    }
    .cc__arrow {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--st-glass);
      backdrop-filter: blur(8px);
      border: 1px solid var(--st-line-strong);
      color: #fff;
      transition: transform 0.35s ease, background-color 0.35s ease, color 0.35s ease,
        box-shadow 0.35s ease;
    }
    .cc__arrow svg {
      width: 20px;
      height: 20px;
    }
    .cc:hover .cc__arrow {
      background: var(--st-lime);
      color: var(--st-lime-ink);
      transform: rotate(45deg);
      box-shadow: 0 0 22px var(--st-lime-glow);
    }
    .cc__content {
      position: absolute;
      left: 0;
      bottom: 0;
      padding: clamp(18px, 2.6vw, 28px);
      z-index: 1;
    }
    .cc__title {
      margin: 0;
      font-family: var(--st-font-display);
      font-size: clamp(1.3rem, 3vw, 1.9rem);
      font-weight: 800;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: #fff;
    }
    .cc__meta {
      display: inline-block;
      margin-top: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--st-lime);
    }
  `,
})
export class CollectionCardComponent {
  readonly collection = input.required<StoreCollection>();
  /** En modo catálogo: muestra el nº de productos en lugar del CTA genérico. */
  readonly countPill = input(false);

  readonly initial = computed(() => this.collection().name.charAt(0).toUpperCase());

  readonly metaLabel = computed(() => {
    const n = this.collection().productCount;
    if (this.countPill() && n > 0) {
      return `${n} ${n === 1 ? 'producto' : 'productos'}`;
    }
    return 'Ver categoría';
  });
}
