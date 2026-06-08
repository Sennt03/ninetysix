/** Configuración compartida de la tienda pública (fuente única de verdad). */

/** Imagen de marca usada en los heros (servida desde `public/img/`). */
export const HERO_IMAGE = '/img/hero.webp';

// --- Contacto / redes (datos de negocio) ---
export const STORE_WHATSAPP_NUMBER = '573001234567';
export const STORE_WHATSAPP = `https://wa.me/${STORE_WHATSAPP_NUMBER}`;
export const STORE_PHONE_DISPLAY = '+57 300 123 4567';
export const STORE_EMAIL = 'info@ninetysix.co';
export const STORE_CITY = 'Medellín, Colombia';
export const STORE_INSTAGRAM = 'https://instagram.com/ninetysix.co';
export const STORE_TIKTOK = 'https://tiktok.com/@ninetysix';
export const STORE_FACEBOOK = 'https://facebook.com';

export type SocialIcon = 'instagram' | 'tiktok' | 'facebook' | 'whatsapp';

export interface StoreSocial {
  name: string;
  handle: string;
  desc: string;
  url: string;
  cta: string;
  icon: SocialIcon;
}

/** Redes sociales (página Redes + footer). */
export const STORE_SOCIALS: StoreSocial[] = [
  {
    name: 'Instagram',
    handle: '@ninetysix.co',
    desc: 'Outfits editoriales, drops exclusivos y behind the scenes.',
    url: STORE_INSTAGRAM,
    cta: 'Seguir',
    icon: 'instagram',
  },
  {
    name: 'TikTok',
    handle: '@ninetysix',
    desc: 'Videos de estilo, lookbooks y drops en tiempo real.',
    url: STORE_TIKTOK,
    cta: 'Seguir',
    icon: 'tiktok',
  },
  {
    name: 'Facebook',
    handle: 'NINETY SIX Official',
    desc: 'Comunidad, eventos y novedades de la marca.',
    url: STORE_FACEBOOK,
    cta: 'Seguir',
    icon: 'facebook',
  },
  {
    name: 'WhatsApp',
    handle: STORE_PHONE_DISPLAY,
    desc: 'Pedidos, consultas y atención personalizada.',
    url: STORE_WHATSAPP,
    cta: 'Seguir',
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
  /** Consulta para el mapa/direcciones de Google Maps. */
  mapQuery: string;
}

/** Tiendas físicas (página Ubicaciones). */
export const STORE_LOCATIONS: StoreLocation[] = [
  {
    name: 'Tienda Principal — El Centro',
    tag: 'Flagship',
    address: 'Calle 50 #42-15, Local 201',
    area: 'Medellín, Antioquia',
    hours: ['Lun–Sáb: 10:00am – 8:00pm', 'Dom: 11:00am – 6:00pm'],
    phoneDisplay: '+57 300 123 4567',
    mapQuery: 'Calle 50 #42-15, Medellín, Antioquia, Colombia',
  },
  {
    name: 'Pop-Up — El Poblado',
    tag: 'Pop-up',
    address: 'Carrera 37 #8A-42, Piso 2',
    area: 'Medellín, Antioquia',
    hours: ['Jue–Sáb: 12:00pm – 9:00pm', 'Dom: 12:00pm – 7:00pm'],
    phoneDisplay: '+57 300 765 4321',
    mapQuery: 'Carrera 37 #8A-42, El Poblado, Medellín, Antioquia, Colombia',
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
