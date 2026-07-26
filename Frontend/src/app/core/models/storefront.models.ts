/**
 * Modelos de la tienda pública (storefront). Reflejan exactamente la respuesta
 * de la API pública `GET /api/storefront/*` (sin costPrice, solo datos activos).
 */

/** Tarjeta de producto destacado en la portada / listados. */
export interface StoreProductCard {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  imageAlt: string | null;
  price: number | null;
  comparePrice: number | null;
  inStock: boolean;
  /** Colores (hex) de las variantes, para los puntos de color de la tarjeta. */
  colors: string[];
  categoryName: string | null;
  createdAt: string;
}

/** Tarjeta de colección (categoría) para la portada y el catálogo. */
export interface StoreCollection {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  productCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
}

/** Payload de la portada. */
export interface StoreHome {
  collections: StoreCollection[];
  featuredProducts: StoreProductCard[];
}

/** Payload del catálogo (todas las categorías). */
export interface StoreCatalog {
  categories: StoreCollection[];
}

/** Detalle de una categoría con sus productos. */
export interface StoreCategoryDetail extends StoreCollection {
  products: StoreProductCard[];
}

/** Variante de producto (PDP). */
export interface StoreVariant {
  id: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  stockPolicy: 'deny' | 'allow';
  color: string | null;
  /** Imagen a la que salta la galería al elegir la variante (null = no se mueve). */
  imageAssetId: string | null;
  isDefault: boolean;
  options: { optionType: string; value: string }[];
}

/** Tipo de opción de un producto (Color, Talla, …). */
export interface StoreOptionType {
  name: string;
  values: string[];
}

/** Imagen de producto (PDP). */
export interface StoreImage {
  /** Id del asset: es a lo que apuntan las variantes con `imageAssetId`. */
  assetId: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
}

/** Detalle completo de producto (PDP). */
export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  hasVariants: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  categories: { name: string; slug: string }[];
  images: StoreImage[];
  optionTypes: StoreOptionType[];
  variants: StoreVariant[];
}
