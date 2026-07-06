import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreProduct } from '@models/storefront.models';
import { CartService } from '@services/cart.service';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { map } from 'rxjs';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';
import { PricePipe } from '../../shared/price.pipe';

type SelectorKind = 'color' | 'size' | 'text';

/** PDP: detalle de producto con galería, selección de variantes y carrito. */
@Component({
  selector: 'app-producto',
  imports: [ProductGalleryComponent, RouterLink, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pdp">
      @if (product(); as p) {
        <div class="pdp__inner">
          <div class="pdp__gallery">
            <app-product-gallery [images]="p.images" [alt]="p.name" />
          </div>

          <div class="pdp__info">
            <nav class="pdp__crumbs" aria-label="Ruta">
              <a routerLink="/catalogo">Catálogo</a>
              @if (p.categories.length) {
                <span aria-hidden="true">/</span>
                <a [routerLink]="['/categoria', p.categories[0].slug]">{{ p.categories[0].name }}</a>
              }
            </nav>

            <h1 class="pdp__name">{{ p.name }}</h1>
            @if (leadText()) {
              <p class="pdp__lead">{{ leadText() }}</p>
            }
            @if (descBox()) {
              <div class="pdp__box">
                <span class="pdp__box-label">Descripción</span>
                <p>{{ descBox() }}</p>
              </div>
            }

            @if (selectedVariant(); as v) {
              <div class="pdp__price">
                @if (v.comparePrice != null) {
                  <span class="pdp__compare">{{ v.comparePrice | price }}</span>
                }
                <span class="pdp__amount">{{ v.price | price }}</span>
                @if (v.comparePrice != null) {
                  <span class="pdp__off">-{{ discount(v) }}%</span>
                }
              </div>
            }

            @if (p.hasVariants) {
              @for (ot of p.optionTypes; track ot.name) {
                <div class="pdp__opt">
                  <span class="pdp__opt-label">{{ groupLabel(ot.name) }}</span>

                  @switch (kind(ot.name)) {
                    @case ('color') {
                      <div class="pdp__swatches">
                        @for (val of ot.values; track val) {
                          <button type="button" class="sw"
                            [class.is-active]="selection()[ot.name] === val"
                            [class.is-off]="!isAvailable(ot.name, val)"
                            [style.background]="colorOf(ot.name, val)"
                            [disabled]="!isAvailable(ot.name, val)"
                            (click)="select(ot.name, val)"
                            [attr.aria-label]="val">
                            @if (selection()[ot.name] === val) {
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                            }
                          </button>
                        }
                      </div>
                      <span class="pdp__chosen">{{ ot.name }}: {{ selection()[ot.name] }}</span>
                    }
                    @case ('size') {
                      <div class="pdp__chips">
                        @for (val of ot.values; track val) {
                          <button type="button" class="chip chip--size"
                            [class.is-active]="selection()[ot.name] === val"
                            [disabled]="!isAvailable(ot.name, val)"
                            (click)="select(ot.name, val)">{{ val }}</button>
                        }
                      </div>
                    }
                    @default {
                      <div class="pdp__chips">
                        @for (val of ot.values; track val) {
                          <button type="button" class="chip"
                            [class.is-active]="selection()[ot.name] === val"
                            [disabled]="!isAvailable(ot.name, val)"
                            (click)="select(ot.name, val)">{{ val }}</button>
                        }
                      </div>
                    }
                  }
                </div>
              }
            }

            <div class="pdp__opt">
              <span class="pdp__opt-label">Cantidad</span>
              <div class="pdp__stepper">
                <button type="button" (click)="decQty()" aria-label="Menos">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /></svg>
                </button>
                <span class="pdp__qty">{{ qty() }}</span>
                <button type="button" (click)="incQty()" aria-label="Más">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /></svg>
                </button>
              </div>
            </div>

            @if (stockNote()) {
              <p class="pdp__note">{{ stockNote() }}</p>
            }

            <div class="pdp__actions">
              <button type="button" class="pdp__add" [disabled]="!canAdd()" (click)="addToCart()">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4H6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><path d="M4 6h16M16 10a4 4 0 01-8 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {{ buttonLabel() }}
              </button>
              <a class="pdp__keep" routerLink="/catalogo">Seguir Comprando</a>
            </div>
          </div>
        </div>
      } @else if (outcome() === 'notfound') {
        <div class="pdp__notfound">
          <h1>Producto no encontrado</h1>
          <p>El producto que buscas no existe o ya no está disponible.</p>
          <a class="pdp__back" routerLink="/catalogo">Volver al catálogo</a>
        </div>
      } @else if (outcome() === 'error') {
        <div class="pdp__notfound">
          <h1>No pudimos cargar el producto</h1>
          <p>Puede ser una conexión lenta o el servidor está despertando. Inténtalo de nuevo.</p>
          <button type="button" class="pdp__back" (click)="retry()">Reintentar</button>
        </div>
      } @else {
        <div class="pdp__inner pdp__loading" aria-hidden="true">
          <span class="pdp__sk pdp__sk--img"></span>
          <div class="pdp__sk-col">
            <span class="pdp__sk pdp__sk--line" style="width:70%"></span>
            <span class="pdp__sk pdp__sk--line" style="width:90%"></span>
            <span class="pdp__sk pdp__sk--line" style="width:40%"></span>
            <span class="pdp__sk pdp__sk--block"></span>
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: './producto.component.scss',
})
export class ProductoComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('slug') ?? '',
  });

  readonly product = computed(() => this.storefront.product(this.slug())());
  readonly outcome = computed(() => this.storefront.productOutcome(this.slug())());

  /** Reintenta la carga tras un fallo transitorio (servidor lento/despertando). */
  retry(): void {
    this.storefront.loadProduct(this.slug());
  }

  /** Selección de opciones del usuario (vacía → se usa la variante por defecto). */
  private readonly userSelection = signal<Record<string, string>>({});
  readonly qty = signal(1);

  /** Selección efectiva: variante por defecto + lo que el usuario haya cambiado. */
  readonly selection = computed<Record<string, string>>(() => ({
    ...this.defaultSelection(),
    ...this.userSelection(),
  }));

  private readonly defaultSelection = computed<Record<string, string>>(() => {
    const p = this.product();
    if (!p || !p.hasVariants) {
      return {};
    }
    const def = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    const sel: Record<string, string> = {};
    def?.options.forEach((o) => (sel[o.optionType] = o.value));
    return sel;
  });

  readonly selectedVariant = computed(() => {
    const p = this.product();
    if (!p) {
      return null;
    }
    if (!p.hasVariants) {
      return p.variants[0] ?? null;
    }
    const sel = this.selection();
    return (
      p.variants.find((v) =>
        p.optionTypes.every(
          (t) => v.options.find((o) => o.optionType === t.name)?.value === sel[t.name],
        ),
      ) ?? null
    );
  });

  readonly leadText = computed(() => {
    const p = this.product();
    return p?.shortDescription ?? p?.description ?? null;
  });
  readonly descBox = computed(() => {
    const p = this.product();
    return p?.shortDescription && p?.description ? p.description : null;
  });

  readonly canAdd = computed(() => {
    const v = this.selectedVariant();
    return !!v && !(v.stock <= 0 && v.stockPolicy === 'deny');
  });
  readonly buttonLabel = computed(() => {
    const v = this.selectedVariant();
    if (!v) {
      return 'Selecciona las opciones';
    }
    if (v.stock <= 0 && v.stockPolicy === 'deny') {
      return 'Agotado';
    }
    return 'Agregar al Carrito';
  });
  readonly stockNote = computed(() => {
    const v = this.selectedVariant();
    return v && v.stock <= 0 && v.stockPolicy === 'allow' ? 'Disponible bajo pedido' : null;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const slug = p.get('slug');
      if (slug) {
        this.userSelection.set({});
        this.qty.set(1);
        this.storefront.loadProduct(slug);
      }
    });

    effect(() => {
      const p = this.product();
      if (!p) {
        return;
      }
      this.seo.update({
        title: p.metaTitle ?? `${p.name} · Ninetysix`,
        description: p.metaDescription ?? p.shortDescription ?? p.description,
        image: p.images[0]?.url ?? null,
        type: 'product',
      });
      this.seo.setJsonLd('ld-product', this.productJsonLd(p));
      this.seo.setJsonLd('ld-breadcrumb', this.breadcrumbJsonLd(p));
    });
  }

  private productJsonLd(p: StoreProduct): unknown {
    const prices = p.variants.map((v) => v.price);
    const low = prices.length ? Math.min(...prices) : 0;
    const high = prices.length ? Math.max(...prices) : 0;
    const inStock = p.variants.some((v) => v.stock > 0 || v.stockPolicy === 'allow');
    const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    const url = `${this.seo.siteOrigin}/producto/${p.slug}`;
    const offers =
      low === high
        ? { '@type': 'Offer', price: low.toFixed(2), priceCurrency: 'USD', availability, url }
        : {
            '@type': 'AggregateOffer',
            lowPrice: low.toFixed(2),
            highPrice: high.toFixed(2),
            priceCurrency: 'USD',
            offerCount: p.variants.length,
            availability,
            url,
          };
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.shortDescription ?? p.description ?? undefined,
      image: p.images.map((i) => i.url),
      sku: p.variants.find((v) => v.isDefault)?.sku ?? p.variants[0]?.sku ?? undefined,
      brand: { '@type': 'Brand', name: 'Ninetysix' },
      category: p.categories[0]?.name ?? undefined,
      offers,
    };
  }

  private breadcrumbJsonLd(p: StoreProduct): unknown {
    const items = [
      { name: 'Inicio', path: '/' },
      { name: 'Catálogo', path: '/catalogo' },
    ];
    if (p.categories[0]) {
      items.push({ name: p.categories[0].name, path: `/categoria/${p.categories[0].slug}` });
    }
    items.push({ name: p.name, path: `/producto/${p.slug}` });
    return this.seo.breadcrumb(items);
  }

  // ----------------------------- selección -----------------------------

  kind(typeName: string): SelectorKind {
    const n = typeName.toLowerCase();
    if (n.includes('color') || n.includes('colour')) {
      return 'color';
    }
    if (n.includes('talla') || n.includes('size') || n.includes('tamaño') || n.includes('tamano')) {
      return 'size';
    }
    return 'text';
  }

  groupLabel(typeName: string): string {
    switch (this.kind(typeName)) {
      case 'color':
        return 'Colores disponibles';
      case 'size':
        return 'Tallas';
      default:
        return typeName;
    }
  }

  /** Color (hex) asociado a un valor del tipo de opción de color. */
  colorOf(type: string, value: string): string | null {
    const p = this.product();
    const variant = p?.variants.find((v) =>
      v.options.some((o) => o.optionType === type && o.value === value),
    );
    return variant?.color ?? '#cccccc';
  }

  /** Un valor está disponible si existe variante con ese valor + el resto de la selección. */
  isAvailable(type: string, value: string): boolean {
    const p = this.product();
    if (!p) {
      return false;
    }
    const sel = this.selection();
    return p.variants.some((v) =>
      p.optionTypes.every((t) => {
        const variantValue = v.options.find((o) => o.optionType === t.name)?.value;
        return t.name === type ? variantValue === value : variantValue === sel[t.name];
      }),
    );
  }

  select(type: string, value: string): void {
    this.userSelection.set({ ...this.selection(), [type]: value });
  }

  incQty(): void {
    this.qty.update((q) => q + 1);
  }
  decQty(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }

  /** % de descuento de una variante con precio comparado. */
  discount(v: { price: number; comparePrice: number | null }): number {
    if (!v.comparePrice || v.comparePrice <= v.price) {
      return 0;
    }
    return Math.round((1 - v.price / v.comparePrice) * 100);
  }

  addToCart(): void {
    const p = this.product();
    const v = this.selectedVariant();
    if (!p || !v || !this.canAdd()) {
      return;
    }
    const image = p.images[0]?.thumbnailUrl ?? p.images[0]?.url ?? null;
    this.cart.add(
      {
        variantId: v.id,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image,
        price: v.price,
        options: v.options.map((o) => ({ type: o.optionType, value: o.value })),
      },
      this.qty(),
    );
  }
}
