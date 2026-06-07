import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '@services/cart.service';
import { filter } from 'rxjs';
import { STORE_NAV } from '../../shared/store.config';

/**
 * Cabecera de la tienda. Es fija. En páginas con hero es transparente sobre él y
 * pasa a sólida al hacer scroll; en páginas de detalle (sin hero, `data.hero=false`)
 * es sólida desde el inicio. Incluye navegación, carrito y menú móvil.
 */
@Component({
  selector: 'app-store-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="hd" [class.hd--solid]="!transparent()" [class.hd--menu-open]="menuOpen()">
      <div class="hd__inner">
        <a class="hd__brand" routerLink="/" aria-label="Ninetysix — Inicio" (click)="closeMenu()">Ninetysix</a>

        <nav class="hd__nav" aria-label="Navegación principal">
          @for (item of nav; track item.link) {
            <a
              class="hd__link"
              [routerLink]="item.link"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.link === '/' }"
            >{{ item.label }}</a>
          }
        </nav>

        <div class="hd__actions">
          <button type="button" class="hd__icon-btn" aria-label="Carrito de compras" (click)="cart.toggle()">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4H6z" stroke="currentColor"
                stroke-width="1.6" stroke-linejoin="round" />
              <path d="M4 6h16M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            @if (hasItems()) {
              <span class="hd__badge">{{ cartCount() }}</span>
            }
          </button>

          <button
            type="button"
            class="hd__icon-btn hd__burger"
            [attr.aria-expanded]="menuOpen()"
            aria-label="Abrir menú"
            (click)="toggleMenu()"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.7"
                stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Menú móvil -->
    <div class="mob" [class.mob--open]="menuOpen()">
      <button type="button" class="mob__backdrop" aria-label="Cerrar menú" (click)="closeMenu()"></button>
      <aside class="mob__panel" role="dialog" aria-label="Menú">
        <div class="mob__head">
          <span class="mob__brand">Ninetysix</span>
          <button type="button" class="hd__icon-btn" aria-label="Cerrar menú" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.7"
                stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <nav class="mob__nav">
          @for (item of nav; track item.link) {
            <a
              class="mob__link"
              [routerLink]="item.link"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.link === '/' }"
              (click)="closeMenu()"
            >{{ item.label }}</a>
          }
        </nav>
      </aside>
    </div>
  `,
  styleUrl: './store-header.component.scss',
})
export class StoreHeaderComponent {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly cartCount = this.cart.count;
  readonly hasItems = this.cart.hasItems;
  readonly menuOpen = signal(false);
  private readonly scrolled = signal(false);

  /** Señal que cambia en cada navegación (fuerza recálculo de `transparent`). */
  private readonly navTick = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  /**
   * Transparente solo en páginas con hero y mientras no se ha hecho scroll.
   * La data de ruta se lee en tiempo de render (no en el constructor, donde el
   * routerState aún no está disponible en SSR).
   */
  readonly transparent = computed(() => {
    this.navTick();
    return this.routeWantsHero() && !this.scrolled();
  });

  readonly nav = STORE_NAV;

  constructor() {
    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    });
  }

  toggleMenu(): void {
    this.setMenu(!this.menuOpen());
  }

  closeMenu(): void {
    this.setMenu(false);
  }

  private setMenu(open: boolean): void {
    this.menuOpen.set(open);
    if (this.isBrowser) {
      document.body.style.overflow = open ? 'hidden' : '';
    }
  }

  /** Lee `data.hero` de la ruta activa más profunda (por defecto true). */
  private routeWantsHero(): boolean {
    let route = this.router.routerState?.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return route?.snapshot?.data?.['hero'] !== false;
  }
}
