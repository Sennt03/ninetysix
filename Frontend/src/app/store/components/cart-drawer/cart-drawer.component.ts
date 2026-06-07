import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@services/cart.service';
import { PricePipe } from '../../shared/price.pipe';

/**
 * Drawer del carrito: panel lateral que entra desde la derecha al pulsar el
 * icono del carrito. Lista las líneas, permite ajustar cantidades / eliminar,
 * y finaliza el pedido por WhatsApp. Vive en el layout (disponible en toda la tienda).
 */
@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cd" [class.cd--open]="cart.isOpen()">
      <button type="button" class="cd__backdrop" aria-label="Cerrar carrito" (click)="cart.close()"></button>

      <aside class="cd__panel" role="dialog" aria-label="Tu carrito">
        <header class="cd__head">
          <div>
            <h2 class="cd__title">Tu Carrito</h2>
            <p class="cd__sub">{{ cart.count() }} {{ cart.count() === 1 ? 'producto seleccionado' : 'productos seleccionados' }}</p>
          </div>
          <button type="button" class="cd__close" aria-label="Cerrar" (click)="cart.close()">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
          </button>
        </header>

        @if (cart.hasItems()) {
          <div class="cd__items">
            @for (item of cart.items(); track item.variantId) {
              <article class="ci">
                <a class="ci__img" [routerLink]="['/producto', item.slug]" (click)="cart.close()">
                  @if (item.image) {
                    <img [src]="item.image" [alt]="item.name" loading="lazy" />
                  } @else {
                    <span class="ci__ph" aria-hidden="true"></span>
                  }
                </a>
                <div class="ci__body">
                  <a class="ci__name" [routerLink]="['/producto', item.slug]" (click)="cart.close()">{{ item.name }}</a>
                  @if (item.options.length) {
                    <p class="ci__opts">
                      @for (o of item.options; track o.type) {
                        <span>{{ o.type }}: {{ o.value }}</span>
                      }
                    </p>
                  }
                  <div class="ci__row">
                    <div class="ci__qty">
                      <button type="button" (click)="cart.dec(item.variantId)" aria-label="Quitar uno">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                      </button>
                      <span class="ci__num">{{ item.qty }}</span>
                      <button type="button" (click)="cart.inc(item.variantId)" aria-label="Añadir uno">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                      </button>
                    </div>
                    <span class="ci__sub">{{ item.price * item.qty | price }}</span>
                  </div>
                </div>
                <button type="button" class="ci__del" (click)="cart.remove(item.variantId)" aria-label="Eliminar del carrito">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              </article>
            }
          </div>

          <footer class="cd__foot">
            <div class="cd__total">
              <div class="cd__total-info">
                <span class="cd__total-label">Total</span>
                <span class="cd__total-count">{{ cart.count() }} {{ cart.count() === 1 ? 'producto' : 'productos' }}</span>
              </div>
              <strong>{{ cart.total() | price }}</strong>
            </div>
            <a class="cd__wa" [href]="cart.whatsappUrl()" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8 8 0 1112 20a8 8 0 01-4-1.1l-4.5 1.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
              Finalizar Pedido por WhatsApp
            </a>
            <button type="button" class="cd__continue" (click)="cart.close()">Continuar Comprando</button>
          </footer>
        } @else {
          <div class="cd__empty">
            <span class="cd__empty-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4H6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="M4 6h16M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <p class="cd__empty-txt">Tu carrito está vacío</p>
            <button type="button" class="cd__continue" (click)="cart.close()">Explorar productos</button>
          </div>
        }
      </aside>
    </div>
  `,
  styleUrl: './cart-drawer.component.scss',
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // Bloquea el scroll del body cuando el carrito está abierto.
    effect(() => {
      const open = this.cart.isOpen();
      if (this.isBrowser) {
        document.body.style.overflow = open ? 'hidden' : '';
      }
    });
  }
}
