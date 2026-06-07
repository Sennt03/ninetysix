/** Configuración compartida de la tienda pública. */

/** Imagen de marca usada en los heros (servida desde `public/img/`). */
export const HERO_IMAGE = '/img/hero.webp';

export interface StoreNavLink {
  label: string;
  link: string;
}

/** Navegación principal (header + footer). Fuente única de verdad. */
export const STORE_NAV: StoreNavLink[] = [
  { label: 'Inicio', link: '/' },
  { label: 'Catálogo', link: '/catalogo' },
  { label: 'Historia', link: '/historia' },
  { label: 'Reseñas', link: '/resenas' },
  { label: 'Redes', link: '/redes' },
  { label: 'Tiendas', link: '/tiendas' },
];
