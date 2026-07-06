import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { StoreImage } from '@models/storefront.models';

/**
 * Galería de imágenes de producto: imagen principal + miniaturas, con lightbox
 * a pantalla completa (zoom con paneo, cerrar y navegación). Apta para PC y móvil.
 */
@Component({
  selector: 'app-product-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gal">
      <div class="gal__main">
        @if (current(); as img) {
          <button type="button" class="gal__open" (click)="openLightbox()" aria-label="Ampliar imagen">
            <img [src]="img.url" [alt]="img.altText || alt()" decoding="async" />
          </button>
          <span class="gal__hint" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7" /><path d="M21 21l-4-4M11 8v6M8 11h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
          </span>
        } @else {
          <div class="gal__ph" aria-hidden="true"></div>
        }

        @if (images().length > 1) {
          <button type="button" class="gal__nav gal__nav--prev" (click)="prev()" aria-label="Imagen anterior">
            <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <button type="button" class="gal__nav gal__nav--next" (click)="next()" aria-label="Imagen siguiente">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        }
      </div>

      @if (images().length > 1) {
        <div class="gal__thumbs">
          @for (img of images(); track $index) {
            <button type="button" class="gal__thumb" [class.is-active]="$index === index()"
              (click)="go($index)" [attr.aria-label]="'Ver imagen ' + ($index + 1)">
              <img [src]="img.thumbnailUrl || img.url" [alt]="img.altText || alt()" loading="lazy" />
            </button>
          }
        </div>
      }
    </div>

    @if (lightbox()) {
      <div class="lb" (click)="closeLightbox()">
        <button type="button" class="lb__btn lb__close" (click)="closeLightbox()" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /></svg>
        </button>
        <button type="button" class="lb__btn lb__zoom" (click)="toggleZoom(); $event.stopPropagation()" [attr.aria-label]="zoomed() ? 'Alejar' : 'Acercar'">
          @if (zoomed()) {
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" /><path d="M21 21l-4-4M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" /><path d="M21 21l-4-4M11 8v6M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
          }
        </button>

        @if (images().length > 1) {
          <button type="button" class="lb__btn lb__nav lb__nav--prev" (click)="prev(); $event.stopPropagation()" aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <button type="button" class="lb__btn lb__nav lb__nav--next" (click)="next(); $event.stopPropagation()" aria-label="Siguiente">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        }

        <figure class="lb__stage" (click)="$event.stopPropagation()">
          <img
            class="lb__img"
            [class.is-zoom]="zoomed()"
            [src]="current()?.url"
            [alt]="current()?.altText || alt()"
            [style.transform-origin]="origin()"
            (click)="toggleZoom()"
            (mousemove)="onMove($event)"
          />
        </figure>

        @if (images().length > 1) {
          <span class="lb__counter" (click)="$event.stopPropagation()">{{ index() + 1 }} / {{ images().length }}</span>
        }
      </div>
    }
  `,
  styleUrl: './product-gallery.component.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class ProductGalleryComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly images = input.required<StoreImage[]>();
  readonly alt = input('');

  readonly index = signal(0);
  readonly lightbox = signal(false);
  readonly zoomed = signal(false);
  readonly origin = signal('50% 50%');

  readonly current = computed(() => {
    const imgs = this.images();
    return imgs.length ? imgs[Math.min(this.index(), imgs.length - 1)] : null;
  });

  constructor() {
    effect(() => {
      const open = this.lightbox();
      if (this.isBrowser) {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });

    // Precarga en segundo plano las imágenes grandes del producto: al cambiar de
    // foto en la galería (o abrir el lightbox) ya están en la caché del navegador,
    // así el cambio es instantáneo. Antes cada primer cambio disparaba la descarga
    // del archivo grande y se notaba el tirón, sobre todo en hosting compartido.
    effect(() => {
      const imgs = this.images();
      if (!this.isBrowser || imgs.length < 2) {
        return;
      }
      const warm = () => {
        for (const img of imgs) {
          const pre = new Image();
          pre.src = img.url;
        }
      };
      const idle = (globalThis as { requestIdleCallback?: (cb: () => void) => void })
        .requestIdleCallback;
      // En reposo (tras pintar la portada), para no competir con la imagen visible.
      if (typeof idle === 'function') {
        idle(warm);
      } else {
        setTimeout(warm, 200);
      }
    });
  }

  go(i: number): void {
    this.index.set(i);
    this.zoomed.set(false);
  }
  next(): void {
    this.index.update((i) => (i + 1) % this.images().length);
    this.zoomed.set(false);
  }
  prev(): void {
    this.index.update((i) => (i - 1 + this.images().length) % this.images().length);
    this.zoomed.set(false);
  }

  openLightbox(): void {
    if (this.current()) {
      this.lightbox.set(true);
    }
  }
  closeLightbox(): void {
    this.lightbox.set(false);
    this.zoomed.set(false);
  }
  toggleZoom(): void {
    this.zoomed.update((z) => !z);
  }

  onMove(event: MouseEvent): void {
    if (!this.zoomed()) {
      return;
    }
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.origin.set(`${x}% ${y}%`);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.lightbox()) {
      return;
    }
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    }
  }
}
