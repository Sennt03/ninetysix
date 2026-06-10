import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
// trustProxyHeaders: detrás del proxy de Hostinger hay que confiar en las
// cabeceras X-Forwarded-* para que Angular construya bien la URL y NO caiga a
// CSR. Lo fijamos en código (más fiable que la env var NG_TRUST_PROXY_HEADERS).
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: true });

// Respeta X-Forwarded-Proto/Host detrás de un proxy (para construir URLs absolutas).
app.set('trust proxy', true);

// Detrás del proxy/caché de Hostinger el header Host llega como el dominio
// interno (xxx.hostingersite.com), y el SSR de Angular rechaza hosts
// desconocidos cayendo a CSR (se pierde el SEO). Forzamos el host público para
// que el render sea siempre en servidor, sin importar qué mande el proxy.
const publicHost = (() => {
  try {
    return new URL(environment.url_site).host;
  } catch {
    return '';
  }
})();
if (publicHost) {
  app.use((req, _res, next) => {
    // Angular valida tanto "host" como "x-forwarded-host" (SSRF). El proxy de
    // Hostinger pone el dominio interno en ambas; las forzamos al host público.
    req.headers.host = publicHost;
    req.headers['x-forwarded-host'] = publicHost;
    next();
  });
}

/**
 * sitemap.xml dinámico: combina las rutas estáticas con los slugs activos de
 * categorías y productos (consultados a la API pública del catálogo).
 */
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const response = await fetch(`${environment.url_api}/storefront/sitemap`);
    const json = (await response.json()) as {
      data: {
        products: { slug: string; updatedAt: string }[];
        categories: { slug: string; updatedAt: string }[];
      };
    };
    const staticPaths = ['/', '/catalogo', '/historia', '/resenas', '/redes', '/tiendas'];
    const entries: { loc: string; lastmod?: string }[] = [
      ...staticPaths.map((p) => ({ loc: base + p })),
      ...json.data.categories.map((c) => ({
        loc: `${base}/categoria/${c.slug}`,
        lastmod: c.updatedAt,
      })),
      ...json.data.products.map((p) => ({ loc: `${base}/producto/${p.slug}`, lastmod: p.updatedAt })),
    ];
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      entries
        .map(
          (e) =>
            `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`,
        )
        .join('\n') +
      '\n</urlset>\n';
    res.set('Content-Type', 'application/xml').send(xml);
  } catch {
    next();
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Caché en memoria de páginas ya renderizadas por el SSR.
 *
 * Sin esto, cada visita (incluidos bots/crawlers) dispara un render Angular
 * completo: bajo tráfico eso satura el event loop y la RAM, y en hosting
 * compartido el proceso acaba muriendo (OOM). Con una caché de TTL corto, una
 * sola portada renderizada sirve a miles de peticiones idénticas.
 *
 * Limitado en número de entradas (la propia caché no debe convertirse en una
 * fuga de RAM) y en tiempo (los cambios del panel se reflejan al expirar el TTL).
 */
interface CachedPage {
  body: string;
  status: number;
  headers: [string, string][];
  expires: number;
}
const SSR_CACHE_TTL_MS = 60_000;
const SSR_CACHE_MAX_ENTRIES = 200;
const ssrCache = new Map<string, CachedPage>();

function isCacheable(req: express.Request): boolean {
  if (req.method !== 'GET') return false;
  // El panel y el login son por-usuario / client-rendered: nunca se cachean.
  if (req.path.startsWith('/panel') || req.path.startsWith('/auth')) return false;
  // Si hay sesión (cookie/Authorization), no cacheamos para no servir HTML cruzado.
  if (req.headers.cookie || req.headers.authorization) return false;
  return true;
}

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use(async (req, res, next) => {
  const cacheable = isCacheable(req);
  const key = req.originalUrl;

  if (cacheable) {
    const hit = ssrCache.get(key);
    if (hit && hit.expires > Date.now()) {
      res.status(hit.status);
      for (const [name, value] of hit.headers) res.setHeader(name, value);
      res.setHeader('X-SSR-Cache', 'HIT');
      res.send(hit.body);
      return;
    }
    if (hit) ssrCache.delete(key); // expirada
  }

  try {
    const response = await angularApp.handle(req);
    if (!response) {
      next();
      return;
    }

    if (cacheable && response.ok && response.status === 200) {
      const body = await response.clone().text();
      const headers: [string, string][] = [];
      response.headers.forEach((value, name) => headers.push([name, value]));
      // Evicción simple FIFO si se llena (Map mantiene orden de inserción).
      if (ssrCache.size >= SSR_CACHE_MAX_ENTRIES) {
        const oldest = ssrCache.keys().next().value;
        if (oldest !== undefined) ssrCache.delete(oldest);
      }
      ssrCache.set(key, {
        body,
        status: response.status,
        headers,
        expires: Date.now() + SSR_CACHE_TTL_MS,
      });
      res.setHeader('X-SSR-Cache', 'MISS');
    }

    await writeResponseToNodeResponse(response, res);
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
