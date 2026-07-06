import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  Signal,
  StateKey,
  TransferState,
  WritableSignal,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { environment } from '@env/environment';
import { ApiResponse } from '@models/api.models';
import {
  StoreCatalog,
  StoreCategoryDetail,
  StoreHome,
  StoreProduct,
  StoreProductCard,
} from '@models/storefront.models';
import { map, timeout } from 'rxjs';

const CACHE_PREFIX = 'ninetysix_sf_';

/** Tope para los fetch de datos: si la API tarda más, se abandona (no cuelga el render SSR). */
const FETCH_TIMEOUT_MS = 8000;

/** Resultado del último fetch. Distingue "no existe de verdad" (404) de un fallo
 *  transitorio (timeout/red/5xx), para no mostrar "no encontrado" cuando en
 *  realidad el servidor estaba lento o despertando. */
type FetchOutcome = 'ok' | 'notfound' | 'error';

/** Recurso reactivo con estado de carga (data + settled + outcome). */
interface Resource<T> {
  data: WritableSignal<T | null>;
  settled: WritableSignal<boolean>;
  /** null mientras carga; luego 'ok' | 'notfound' | 'error'. */
  outcome: WritableSignal<FetchOutcome | null>;
  seeded: boolean;
}

/**
 * Servicio de datos de la tienda pública con estrategia **stale-while-revalidate**
 * para SSR. En el servidor consulta la API, renderiza y serializa en `TransferState`;
 * en el cliente hidrata sin parpadeo (TransferState o `localStorage`) y revalida en
 * segundo plano, repintando solo si cambió. Resiliente ante fallos de la API.
 *
 * Recursos por clave (categoría/producto por slug) memoizados en mapas.
 */
@Injectable({ providedIn: 'root' })
export class StorefrontService {
  private readonly http = inject(HttpClient);
  private readonly state = inject(TransferState);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = this.resolveBaseUrl();

  /**
   * URL base de la API de tienda.
   * - Navegador (y dev): la URL pública configurada.
   * - SSR en producción: **loopback interno** `http://127.0.0.1:PORT/api`. El SSR
   *   corre en el MISMO proceso Node que la API, así que llamarse por el dominio
   *   público obligaría a salir y volver por el proxy/TLS de Hostinger (sobrecoste
   *   y riesgo de que el render se quede esperándose a sí mismo). El loopback lo evita.
   */
  private resolveBaseUrl(): string {
    if (this.isBrowser || !environment.production) {
      return `${environment.url_api}/storefront`;
    }
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    // Válvula de escape: si el loopback 127.0.0.1:PORT no fuese alcanzable en este
    // host, define SSR_API_BASE en el .env del servidor (ej. https://ninetysixshop.com/api)
    // sin recompilar.
    const override = proc?.env?.['SSR_API_BASE'];
    if (override) {
      return `${override.replace(/\/+$/, '')}/storefront`;
    }
    const port = proc?.env?.['PORT'] ?? '3000';
    const apiPath = new URL(environment.url_api).pathname.replace(/\/+$/, ''); // p.ej. '/api'
    return `http://127.0.0.1:${port}${apiPath}/storefront`;
  }

  private readonly homeRes = this.make<StoreHome>();
  private readonly catalogRes = this.make<StoreCatalog>();
  private readonly featuredRes = this.make<StoreProductCard[]>();
  private readonly categoryRes = new Map<string, Resource<StoreCategoryDetail>>();
  private readonly productRes = new Map<string, Resource<StoreProduct>>();
  private readonly productsRes = new Map<string, Resource<StoreProductCard[]>>();

  // ----------------------------- portada -----------------------------
  readonly home: Signal<StoreHome | null> = this.homeRes.data.asReadonly();
  loadHome(): void {
    this.swr('home', this.homeRes, '/home');
  }

  // ----------------------------- catálogo -----------------------------
  readonly catalog: Signal<StoreCatalog | null> = this.catalogRes.data.asReadonly();
  loadCatalog(): void {
    this.swr('catalog', this.catalogRes, '/catalog');
  }

  // -------------------- productos del catálogo (PLP) --------------------
  /** Productos por categoría (`''` = todos). Memoizados por clave. */
  products(categorySlug = ''): Signal<StoreProductCard[] | null> {
    return this.ensure(this.productsRes, categorySlug).data;
  }
  productsSettled(categorySlug = ''): Signal<boolean> {
    return this.ensure(this.productsRes, categorySlug).settled;
  }
  loadProducts(categorySlug = ''): void {
    const path = categorySlug
      ? `/products?category=${encodeURIComponent(categorySlug)}`
      : '/products';
    this.swr(`products:${categorySlug}`, this.ensure(this.productsRes, categorySlug), path);
  }

  // ----------------------------- destacados -----------------------------
  readonly featured: Signal<StoreProductCard[] | null> = this.featuredRes.data.asReadonly();
  loadFeatured(): void {
    this.swr('featured', this.featuredRes, '/featured');
  }

  // ----------------------------- categoría -----------------------------
  category(slug: string): Signal<StoreCategoryDetail | null> {
    return this.ensure(this.categoryRes, slug).data;
  }
  categorySettled(slug: string): Signal<boolean> {
    return this.ensure(this.categoryRes, slug).settled;
  }
  categoryOutcome(slug: string): Signal<FetchOutcome | null> {
    return this.ensure(this.categoryRes, slug).outcome;
  }
  loadCategory(slug: string): void {
    this.swr(`category:${slug}`, this.ensure(this.categoryRes, slug), `/categories/${slug}`);
  }

  // ----------------------------- producto -----------------------------
  product(slug: string): Signal<StoreProduct | null> {
    return this.ensure(this.productRes, slug).data;
  }
  productSettled(slug: string): Signal<boolean> {
    return this.ensure(this.productRes, slug).settled;
  }
  productOutcome(slug: string): Signal<FetchOutcome | null> {
    return this.ensure(this.productRes, slug).outcome;
  }
  loadProduct(slug: string): void {
    this.swr(`product:${slug}`, this.ensure(this.productRes, slug), `/products/${slug}`);
  }

  // ----------------------------- núcleo SWR -----------------------------

  private swr<T>(name: string, res: Resource<T>, path: string): void {
    const key = makeStateKey<T>(`sf-${name}`);

    // 1) Siembra una sola vez (cliente): estado transferido del SSR o caché local.
    if (this.isBrowser && !res.seeded) {
      res.seeded = true;
      if (this.state.hasKey(key)) {
        const transferred = this.state.get(key, null as unknown as T);
        if (transferred) {
          res.data.set(transferred);
          res.outcome.set('ok');
          this.writeCache(name, transferred);
        }
        this.state.remove(key);
      } else {
        const cached = this.readCache<T>(name);
        if (cached) {
          res.data.set(cached);
          res.outcome.set('ok');
        }
      }
    }

    // Reintento (cliente, sin datos aún): vuelve al estado de carga para mostrar
    // el esqueleto en vez de dejar el mensaje de error anterior.
    if (this.isBrowser && !res.data()) {
      res.outcome.set(null);
      res.settled.set(false);
    }

    // 2) Revalida contra la API (en SSR para el render; en cliente, en segundo plano).
    this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${path}`)
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        map((r) => r.data),
      )
      .subscribe({
        next: (data) => {
          res.settled.set(true);
          res.outcome.set('ok');
          if (!this.isBrowser) {
            res.data.set(data);
            this.state.set(key, data);
            return;
          }
          if (!this.equal(res.data(), data)) {
            res.data.set(data);
          }
          this.writeCache(name, data);
        },
        error: (err: unknown) => {
          res.settled.set(true);
          // Si ya hay datos sembrados (TransferState/caché), consérvalos: un fallo
          // de revalidación no debe borrar lo que ya se ve.
          if (this.isBrowser && res.data()) {
            res.outcome.set('ok');
            return;
          }
          // 404 = de verdad no existe. Timeout/red/5xx = fallo transitorio (servidor
          // lento o despertando): NO afirmes que no existe, ofrece reintentar.
          const status = err instanceof HttpErrorResponse ? err.status : 0;
          res.outcome.set(status === 404 ? 'notfound' : 'error');
        },
      });
  }

  // ----------------------------- helpers -----------------------------

  private make<T>(): Resource<T> {
    return {
      data: signal<T | null>(null),
      settled: signal(false),
      outcome: signal<FetchOutcome | null>(null),
      seeded: false,
    };
  }

  private ensure<T>(store: Map<string, Resource<T>>, slug: string): Resource<T> {
    let res = store.get(slug);
    if (!res) {
      res = this.make<T>();
      store.set(slug, res);
    }
    return res;
  }

  private equal<T>(a: T | null, b: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private readCache<T>(name: string): T | null {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + name);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private writeCache<T>(name: string, data: T): void {
    try {
      localStorage.setItem(CACHE_PREFIX + name, JSON.stringify(data));
    } catch {
      /* almacenamiento no disponible: se ignora. */
    }
  }
}
