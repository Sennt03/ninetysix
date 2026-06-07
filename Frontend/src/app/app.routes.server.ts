import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Modo de render por ruta:
 *  - `auth` y `panel` (administración) -> Client (SPA, detrás de login, sin SSR).
 *  - el resto (tienda pública: portada, catálogo, producto, etc.) -> Server (SSR para SEO).
 *
 * Las rutas de la tienda se dejan en `RenderMode.Server` (o `Prerender` si fueran estáticas).
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'auth', renderMode: RenderMode.Client },
  { path: 'auth/**', renderMode: RenderMode.Client },
  { path: 'panel', renderMode: RenderMode.Client },
  { path: 'panel/**', renderMode: RenderMode.Client },
  { path: '', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
