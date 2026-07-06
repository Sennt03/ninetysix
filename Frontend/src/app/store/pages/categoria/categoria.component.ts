import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '@services/seo.service';
import { StorefrontService } from '@services/storefront.service';
import { map } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';

/** PLP: detalle de categoría con todos sus productos activos. */
@Component({
  selector: 'app-categoria',
  imports: [ProductCardComponent, RevealOnScrollDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="plp">
      @if (detail(); as cat) {
        <header class="plp__head">
          <nav class="plp__crumbs" aria-label="Ruta">
            <a routerLink="/catalogo">Catálogo</a>
            <span aria-hidden="true">/</span>
            <span>{{ cat.name }}</span>
          </nav>
          <h1 class="plp__title">{{ cat.name }}</h1>
          <p class="plp__count">
            {{ cat.products.length }}
            {{ cat.products.length === 1 ? 'producto disponible' : 'productos disponibles' }}
          </p>
        </header>

        @if (cat.products.length) {
          <div class="plp__grid">
            @for (p of cat.products; track p.id; let i = $index) {
              <div appReveal [appRevealDelay]="(i % 4) * 70">
                <app-product-card [product]="p" [showCategory]="false" />
              </div>
            }
          </div>
        } @else {
          <p class="plp__empty">Esta categoría aún no tiene productos.</p>
        }
      } @else if (outcome() === 'notfound') {
        <div class="plp__notfound">
          <h1>Categoría no encontrada</h1>
          <p>La categoría que buscas no existe o ya no está disponible.</p>
          <a class="plp__back" routerLink="/catalogo">Volver al catálogo</a>
        </div>
      } @else if (outcome() === 'error') {
        <div class="plp__notfound">
          <h1>No pudimos cargar la categoría</h1>
          <p>Puede ser una conexión lenta o el servidor está despertando. Inténtalo de nuevo.</p>
          <button type="button" class="plp__back" (click)="retry()">Reintentar</button>
        </div>
      } @else {
        <div class="plp__loading" aria-hidden="true">
          <span class="plp__sk plp__sk--title"></span>
          <div class="plp__grid">
            @for (n of skeletons; track $index) {
              <span class="plp__sk plp__sk--card"></span>
            }
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: './categoria.component.scss',
})
export class CategoriaComponent {
  private readonly storefront = inject(StorefrontService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  readonly skeletons = Array.from({ length: 6 });

  readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('slug') ?? '',
  });

  readonly detail = computed(() => this.storefront.category(this.slug())());
  readonly outcome = computed(() => this.storefront.categoryOutcome(this.slug())());

  /** Reintenta la carga tras un fallo transitorio (servidor lento/despertando). */
  retry(): void {
    this.storefront.loadCategory(this.slug());
  }

  constructor() {
    // Carga (SSR síncrono + cambios de slug en cliente).
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const slug = p.get('slug');
      if (slug) {
        this.storefront.loadCategory(slug);
      }
    });

    effect(() => {
      const cat = this.detail();
      if (!cat) {
        return;
      }
      this.seo.update({
        title: cat.metaTitle ?? `${cat.name} · Ninetysix`,
        description:
          cat.metaDescription ?? cat.description ?? `Descubre los productos de ${cat.name} en Ninetysix.`,
        image: cat.imageUrl,
      });
      this.seo.setJsonLd(
        'ld-breadcrumb',
        this.seo.breadcrumb([
          { name: 'Inicio', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
          { name: cat.name, path: `/categoria/${cat.slug}` },
        ]),
      );
    });
  }
}
