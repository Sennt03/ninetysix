import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

export interface SeoConfig {
  title: string;
  description?: string | null;
  /** Imagen para Open Graph/Twitter (relativa o absoluta). */
  image?: string | null;
  type?: 'website' | 'product' | 'article';
}

const SITE_NAME = 'Ninetysix';
const LOCALE = 'es_EC';

/**
 * Servicio SEO centralizado (SSR-safe): título, meta description, canonical,
 * Open Graph, Twitter Card y datos estructurados JSON-LD. Funciona en servidor
 * (DOM de SSR) y cliente; evita duplicados al re-ejecutarse tras la hidratación.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleSrv = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  private readonly origin = environment.url_site.replace(/\/+$/, '');
  private readonly defaultImage = `${this.origin}/img/hero.webp`;

  /** Aplica el SEO de la página (limpia los JSON-LD de página previos). */
  update(cfg: SeoConfig): void {
    this.clearPageJsonLd();

    const description = (cfg.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const url = this.canonicalUrl();
    const image = this.absolute(cfg.image) ?? this.defaultImage;
    const type = cfg.type ?? 'website';

    this.titleSrv.setTitle(cfg.title);
    this.setName('description', description);

    this.setProp('og:title', cfg.title);
    this.setProp('og:description', description);
    this.setProp('og:type', type);
    this.setProp('og:url', url);
    this.setProp('og:image', image);
    this.setProp('og:site_name', SITE_NAME);
    this.setProp('og:locale', LOCALE);

    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', cfg.title);
    this.setName('twitter:description', description);
    this.setName('twitter:image', image);

    this.setCanonical(url);
  }

  /** Inserta/actualiza un bloque JSON-LD. scope 'global' sobrevive a la navegación. */
  setJsonLd(id: string, data: unknown, scope: 'page' | 'global' = 'page'): void {
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', scope);
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  /** Construye un BreadcrumbList JSON-LD a partir de items {name, path}. */
  breadcrumb(items: { name: string; path: string }[]): unknown {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: this.origin + (it.path === '/' ? '' : it.path),
      })),
    };
  }

  get siteOrigin(): string {
    return this.origin;
  }

  // ----------------------------- helpers -----------------------------

  private canonicalUrl(): string {
    const path = this.router.url.split('#')[0].split('?')[0];
    return this.origin + (path === '/' ? '' : path);
  }

  private absolute(img?: string | null): string | null {
    if (!img) {
      return null;
    }
    if (/^https?:\/\//.test(img)) {
      return img;
    }
    return this.origin + (img.startsWith('/') ? img : `/${img}`);
  }

  private setName(name: string, content: string): void {
    if (content) {
      this.meta.updateTag({ name, content });
    }
  }

  private setProp(property: string, content: string): void {
    if (content) {
      this.meta.updateTag({ property, content });
    }
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private clearPageJsonLd(): void {
    this.doc.head
      .querySelectorAll('script[data-seo="page"]')
      .forEach((el) => el.remove());
  }
}
