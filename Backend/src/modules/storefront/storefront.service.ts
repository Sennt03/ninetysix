import { Injectable } from '@nestjs/common';
import { CategoryStatus, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

/** Máximo de colecciones en la portada (el resto se verá en la pestaña de catálogo). */
const COLLECTIONS_LIMIT = 6;

/**
 * Tope duro de productos por listado (PLP/categoría/destacados). Evita que un
 * catálogo grande cargue TODO en RAM y se serialice entero en el HTML del SSR
 * (cada render retiene el array completo). Si algún día hace falta más, conviene
 * paginar de verdad (cursor/offset) en vez de subir esta cota.
 */
const PRODUCTS_HARD_CAP = 300;

/** Tarjeta de producto para la tienda pública (NUNCA incluye costPrice). */
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
  /** Colores (hex) de las variantes, para pintar los puntos de color en la tarjeta. */
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

export interface StoreHomePayload {
  collections: StoreCollection[];
  featuredProducts: StoreProductCard[];
}

export interface StoreCatalogPayload {
  categories: StoreCollection[];
}

export interface StoreCategoryDetail extends StoreCollection {
  products: StoreProductCard[];
}

export interface StoreProductVariant {
  id: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  stockPolicy: string;
  color: string | null;
  /** Asset de la imagen a la que salta la galería al elegir la variante (o null). */
  imageAssetId: string | null;
  isDefault: boolean;
  options: { optionType: string; value: string }[];
}

export interface StoreProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  hasVariants: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  categories: { name: string; slug: string }[];
  images: {
    /** Id del asset: lo usan las variantes para apuntar a esta imagen. */
    assetId: string;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
  }[];
  optionTypes: { name: string; values: string[] }[];
  variants: StoreProductVariant[];
}

export interface StoreSitemap {
  products: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
}

const CARD_INCLUDE = {
  categories: { select: { name: true }, take: 1 },
  images: {
    take: 1,
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
    select: {
      altText: true,
      asset: { select: { url: true, thumbnailUrl: true } },
    },
  },
  variants: {
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      price: true,
      comparePrice: true,
      stock: true,
      stockPolicy: true,
      isDefault: true,
      color: true,
    },
  },
} satisfies Prisma.ProductInclude;

const DETAIL_INCLUDE = {
  categories: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
    select: { altText: true, assetId: true, asset: { select: { url: true, thumbnailUrl: true } } },
  },
  optionTypes: {
    orderBy: { sortOrder: 'asc' },
    include: { values: { orderBy: { sortOrder: 'asc' } } },
  },
  variants: {
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    include: { options: { include: { optionValue: { include: { optionType: true } } } } },
  },
} satisfies Prisma.ProductInclude;

type ProductCardRow = Prisma.ProductGetPayload<{ include: typeof CARD_INCLUDE }>;
type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof DETAIL_INCLUDE }>;

const COLLECTION_SELECT = {
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  imageAlt: true,
  metaTitle: true,
  metaDescription: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategorySelect;

type CollectionRow = Prisma.CategoryGetPayload<{ select: typeof COLLECTION_SELECT }>;

/**
 * Servicio de solo lectura para la tienda pública. Expone datos seguros
 * (sin costPrice, solo entidades `active`) optimizados para SSR.
 */
@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  /** Portada: colecciones destacadas (máx 3) + todos los productos destacados. */
  async getHome(): Promise<StoreHomePayload> {
    const [collections, products] = await Promise.all([
      this.prisma.category.findMany({
        where: { status: CategoryStatus.active, imageUrl: { not: null } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        take: COLLECTIONS_LIMIT,
        select: COLLECTION_SELECT,
      }),
      this.prisma.product.findMany({
        where: { status: ProductStatus.active, featured: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: CARD_INCLUDE,
      }),
    ]);

    return {
      collections: collections.map((c) => this.toCollection(c)),
      featuredProducts: products.map((p) => this.toCard(p)),
    };
  }

  /** Catálogo: TODAS las categorías activas. */
  async getCatalog(): Promise<StoreCatalogPayload> {
    const categories = await this.prisma.category.findMany({
      where: { status: CategoryStatus.active },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: COLLECTION_SELECT,
    });
    return { categories: categories.map((c) => this.toCollection(c)) };
  }

  /**
   * Productos activos para la PLP del catálogo. Sin filtro → todos; con `categorySlug`
   * → los de esa categoría y sus descendientes. Devuelve [] si la categoría no existe.
   */
  async getProducts(categorySlug?: string): Promise<StoreProductCard[]> {
    const where: Prisma.ProductWhereInput = { status: ProductStatus.active };

    if (categorySlug) {
      const cat = await this.prisma.category.findFirst({
        where: { slug: categorySlug, status: CategoryStatus.active },
        select: { id: true },
      });
      if (!cat) {
        return [];
      }
      const ids = await this.activeCategoryAndDescendants(cat.id);
      where.categories = { some: { id: { in: ids } } };
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: CARD_INCLUDE,
      take: PRODUCTS_HARD_CAP,
    });
    return products.map((p) => this.toCard(p));
  }

  /** Productos destacados activos (página Destacados). */
  async getFeatured(): Promise<StoreProductCard[]> {
    const products = await this.prisma.product.findMany({
      where: { status: ProductStatus.active, featured: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: CARD_INCLUDE,
      take: PRODUCTS_HARD_CAP,
    });
    return products.map((p) => this.toCard(p));
  }

  /** Detalle de categoría + todos sus productos activos (incluye subcategorías). */
  async getCategory(slug: string): Promise<StoreCategoryDetail | null> {
    const cat = await this.prisma.category.findFirst({
      where: { slug, status: CategoryStatus.active },
      select: { ...COLLECTION_SELECT, id: true },
    });
    if (!cat) {
      return null;
    }

    const categoryIds = await this.activeCategoryAndDescendants(cat.id);
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.active,
        categories: { some: { id: { in: categoryIds } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: CARD_INCLUDE,
      take: PRODUCTS_HARD_CAP,
    });

    return {
      ...this.toCollection(cat),
      productCount: products.length,
      products: products.map((p) => this.toCard(p)),
    };
  }

  /** Detalle público de un producto (con todas sus variantes; sin costPrice). */
  async getProduct(slug: string): Promise<StoreProductDetail | null> {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.active },
      include: DETAIL_INCLUDE,
    });
    if (!product) {
      return null;
    }
    return this.toDetail(product);
  }

  /** Slugs activos (producto + categoría) con su fecha, para el sitemap.xml. */
  async getSitemap(): Promise<StoreSitemap> {
    const [products, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: ProductStatus.active },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.category.findMany({
        where: { status: CategoryStatus.active },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    return {
      products: products.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt.toISOString() })),
      categories: categories.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt.toISOString() })),
    };
  }

  // ----------------------------- helpers -----------------------------

  /** IDs de la categoría y todas sus descendientes activas. */
  private async activeCategoryAndDescendants(rootId: string): Promise<string[]> {
    const all = await this.prisma.category.findMany({
      where: { status: CategoryStatus.active },
      select: { id: true, parentId: true },
    });
    const childrenOf = new Map<string, string[]>();
    for (const c of all) {
      if (c.parentId) {
        const list = childrenOf.get(c.parentId) ?? [];
        list.push(c.id);
        childrenOf.set(c.parentId, list);
      }
    }
    const ids: string[] = [rootId];
    const stack = [rootId];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const child of childrenOf.get(cur) ?? []) {
        ids.push(child);
        stack.push(child);
      }
    }
    return ids;
  }

  // ----------------------------- mapeo -----------------------------

  private toCollection(c: CollectionRow): StoreCollection {
    return {
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
      productCount: c._count.products,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
    };
  }

  private toCard(p: ProductCardRow): StoreProductCard {
    const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    const price = defaultVariant ? Number(defaultVariant.price) : null;
    const compareRaw =
      defaultVariant?.comparePrice != null ? Number(defaultVariant.comparePrice) : null;
    const comparePrice =
      compareRaw != null && price != null && compareRaw > price ? compareRaw : null;
    const inStock = p.variants.some((v) => v.stock > 0 || v.stockPolicy === 'allow');
    const colors = [
      ...new Set(p.variants.map((v) => v.color).filter((c): c is string => !!c)),
    ];
    const cover = p.images[0];

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      imageUrl: cover?.asset.url ?? null,
      thumbnailUrl: cover?.asset.thumbnailUrl ?? cover?.asset.url ?? null,
      imageAlt: cover?.altText ?? p.name,
      price,
      comparePrice,
      inStock,
      colors,
      categoryName: p.categories[0]?.name ?? null,
      createdAt: p.createdAt.toISOString(),
    };
  }

  private toDetail(p: ProductDetailRow): StoreProductDetail {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      hasVariants: p.hasVariants,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      categories: p.categories.map((c) => ({ name: c.name, slug: c.slug })),
      images: p.images.map((img) => ({
        assetId: img.assetId,
        url: img.asset.url,
        thumbnailUrl: img.asset.thumbnailUrl,
        altText: img.altText,
      })),
      optionTypes: p.optionTypes.map((ot) => ({
        name: ot.name,
        values: ot.values.map((v) => v.value),
      })),
      variants: p.variants.map((v) => {
        const price = Number(v.price);
        const compareRaw = v.comparePrice != null ? Number(v.comparePrice) : null;
        return {
          id: v.id,
          sku: v.sku,
          price,
          comparePrice: compareRaw != null && compareRaw > price ? compareRaw : null,
          stock: v.stock,
          stockPolicy: v.stockPolicy,
          color: v.color,
          imageAssetId: v.imageAssetId,
          isDefault: v.isDefault,
          options: v.options.map((o) => ({
            optionType: o.optionValue.optionType.name,
            value: o.optionValue.value,
          })),
        };
      }),
    };
  }
}
