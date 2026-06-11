/** Configuración compartida de la tienda pública (fuente única de verdad). */

/** Imagen de marca usada en los heros (servida desde `public/img/`). */
export const HERO_IMAGE = '/img/hero.webp';

/** Logo de marca (versión blanca para fondos oscuros), en `public/img/`. */
export const BRAND_LOGO = '/img/logo-blanco.png';

// --- Contacto / redes (datos de negocio) ---
export const STORE_WHATSAPP_NUMBER = '593983474862';
/** Enlace corto "click to chat" de WhatsApp Business (botones genéricos). */
export const STORE_WHATSAPP = 'https://wa.me/message/N3TR75Q2YNDVO1';
export const STORE_PHONE_DISPLAY = '+593 98 347 4862';
export const STORE_CITY = 'Quito, Ecuador';
export const STORE_INSTAGRAM = 'https://www.instagram.com/ninetysix96_2026';
export const STORE_TIKTOK = 'https://www.tiktok.com/@ninetysix96822?_r=1&_t=ZS-976sqHuYqjE';

/** Enlace de WhatsApp con un mensaje prellenado (usa el número, no el short link). */
export function whatsappLink(text: string): string {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type SocialIcon = 'instagram' | 'tiktok' | 'whatsapp';

export interface StoreSocial {
  name: string;
  handle: string;
  desc: string;
  url: string;
  cta: string;
  icon: SocialIcon;
}

/** Redes sociales (página Redes + footer). Solo TikTok, Instagram y WhatsApp. */
export const STORE_SOCIALS: StoreSocial[] = [
  {
    name: 'Instagram',
    handle: '@ninetysix96_2026',
    desc: 'Outfits editoriales, drops exclusivos y behind the scenes.',
    url: STORE_INSTAGRAM,
    cta: 'Seguir',
    icon: 'instagram',
  },
  {
    name: 'TikTok',
    handle: '@ninetysix96822',
    desc: 'Videos de estilo, lookbooks y drops en tiempo real.',
    url: STORE_TIKTOK,
    cta: 'Seguir',
    icon: 'tiktok',
  },
  {
    name: 'WhatsApp',
    handle: STORE_PHONE_DISPLAY,
    desc: 'Pedidos, consultas y atención personalizada.',
    url: STORE_WHATSAPP,
    cta: 'Escribir',
    icon: 'whatsapp',
  },
];

export interface StoreLocation {
  name: string;
  tag: string;
  address: string;
  area: string;
  hours: string[];
  phoneDisplay: string;
  /** Consulta para el mapa embebido de Google Maps. */
  mapQuery: string;
  /** Enlace directo (opcional) a Google Maps para el botón "Ver en Maps". */
  mapUrl?: string;
}

/** Tiendas físicas (página Ubicaciones). */
export const STORE_LOCATIONS: StoreLocation[] = [
  {
    name: 'Tienda Principal — Centro',
    tag: 'Flagship',
    address: 'C.C. Hermano Miguel, Locales 915–925, Piso 2, Pasillo 11B',
    area: 'Quito, Ecuador',
    hours: ['Lun–Sáb: 9:00am – 6:00pm', 'Dom: 10:00am – 5:00pm'],
    phoneDisplay: STORE_PHONE_DISPLAY,
    mapQuery: 'Centro Comercial Hermano Miguel, Quito, Ecuador',
    mapUrl: 'https://maps.app.goo.gl/AR67yPGEgd2TB2289?g_st=ic',
  },
];

export interface StoreNavLink {
  label: string;
  link: string;
}

/** Navegación principal (header + footer). */
export const STORE_NAV: StoreNavLink[] = [
  { label: 'Inicio', link: '/' },
  { label: 'Catálogo', link: '/catalogo' },
  { label: 'Destacados', link: '/destacados' },
  { label: 'Ubicaciones', link: '/ubicaciones' },
  { label: 'Redes', link: '/redes' },
  { label: 'Contacto', link: '/contacto' },
];
