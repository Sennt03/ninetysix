import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus, StockPolicy } from '@prisma/client';
import { ReorderItemDto } from '../../common/dto/reorder.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { uniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import {
  CreateProductDto,
  OptionTypeInputDto,
  ProductImageInputDto,
  VariantInputDto,
} from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const DETAIL_INCLUDE = {
  categories: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' }, include: { asset: true } },
  optionTypes: {
    orderBy: { sortOrder: 'asc' },
    include: { values: { orderBy: { sortOrder: 'asc' } } },
  },
  variants: {
    orderBy: { sortOrder: 'asc' },
    include: { options: { include: { optionValue: { include: { optionType: true } } } } },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<ProductListItem>> {
    const { page, limit, skip } = query;
    const where: Prisma.ProductWhereInput = {
      ...(query.status?.length && { status: { in: query.status } }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.hasVariants !== undefined && { hasVariants: query.hasVariants }),
      ...(query.categoryId && { categories: { some: { id: query.categoryId } } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search } },
          { description: { contains: query.search } },
          { variants: { some: { sku: { contains: query.search } } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          categories: { select: { id: true, name: true } },
          images: {
            take: 1,
            orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
            select: { asset: { select: { url: true, thumbnailUrl: true } } },
          },
          variants: {
            select: { price: true, sku: true, stock: true, active: true, isDefault: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => this.toListItem(p)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: string): Promise<ProductDetail> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.toDetail(product);
  }

  async create(dto: CreateProductDto): Promise<ProductDetail> {
    const slug = dto.slug
      ? await this.assertSlugFree(dto.slug)
      : await uniqueSlug(dto.name, (s) => this.slugExists(s));

    let variants = this.normalizeDefaults(dto.variants);
    this.assertComparePrices(variants);
    this.assertPublishable(dto.status ?? ProductStatus.draft, variants);

    const images = this.normalizeImages(dto.images);
    if (images.length) {
      await this.media.assertAssetsExist(images.map((i) => i.assetId));
    }
    variants = this.normalizeVariantImages(variants, images.map((i) => i.assetId));

    try {
      const id = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: dto.name,
            slug,
            description: dto.description ?? null,
            shortDescription: dto.shortDescription ?? null,
            status: dto.status ?? ProductStatus.draft,
            hasVariants: dto.hasVariants ?? false,
            sortOrder: dto.sortOrder ?? 0,
            featured: dto.featured ?? false,
            metaTitle: dto.metaTitle ?? null,
            metaDescription: dto.metaDescription ?? null,
            ...(dto.categoryIds?.length && {
              categories: { connect: dto.categoryIds.map((cid) => ({ id: cid })) },
            }),
          },
        });
        await this.writeOptionsAndVariants(tx, product.id, dto.optionTypes, variants);
        await this.writeImages(tx, product.id, images);
        return product.id;
      });
      return await this.findOne(id);
    } catch (e) {
      this.rethrow(e);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, status: true },
    });
    if (!existing) {
      throw new NotFoundException('Producto no encontrado');
    }
    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugFree(dto.slug, id);
    }

    const replaceVariants = dto.variants !== undefined;
    let variants: VariantInputDto[] | undefined;
    if (replaceVariants) {
      variants = this.normalizeDefaults(dto.variants!);
      this.assertComparePrices(variants);
      this.assertPublishable(dto.status ?? existing.status, variants);
    }

    const syncImages = dto.images !== undefined;
    let images: ProductImageInputDto[] = [];
    let removedAssetIds: string[] = [];
    if (syncImages) {
      images = this.normalizeImages(dto.images);
      if (images.length) {
        await this.media.assertAssetsExist(images.map((i) => i.assetId));
      }
      const current = await this.prisma.productImage.findMany({
        where: { productId: id },
        select: { assetId: true },
      });
      const nextAssetIds = new Set(images.map((i) => i.assetId));
      removedAssetIds = current.map((c) => c.assetId).filter((a) => !nextAssetIds.has(a));
    }

    // El puntero variante→imagen solo vale si apunta a una imagen del producto:
    // se compara contra las imágenes que quedarán tras este guardado.
    if (variants) {
      const allowed = syncImages
        ? images.map((i) => i.assetId)
        : (
            await this.prisma.productImage.findMany({
              where: { productId: id },
              select: { assetId: true },
            })
          ).map((i) => i.assetId);
      variants = this.normalizeVariantImages(variants, allowed);
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.slug !== undefined && { slug: dto.slug }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.hasVariants !== undefined && { hasVariants: dto.hasVariants }),
            ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
            ...(dto.featured !== undefined && { featured: dto.featured }),
            ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
            ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
            ...(dto.categoryIds !== undefined && {
              categories: { set: dto.categoryIds.map((cid) => ({ id: cid })) },
            }),
          },
        });
        if (replaceVariants && variants) {
          await tx.variant.deleteMany({ where: { productId: id } });
          await tx.optionType.deleteMany({ where: { productId: id } });
          await this.writeOptionsAndVariants(tx, id, dto.optionTypes, variants);
        }
        if (syncImages) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          await this.writeImages(tx, id, images);
        }
      });
      // Fuera de la transacción: borra del disco los assets que quedaron huérfanos.
      if (removedAssetIds.length) {
        await this.media.cleanupOrphans(removedAssetIds);
      }
      return await this.findOne(id);
    } catch (e) {
      this.rethrow(e);
    }
  }

  async remove(id: string): Promise<void> {
    const links = await this.prisma.productImage.findMany({
      where: { productId: id },
      select: { assetId: true },
    });
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Producto no encontrado');
    }
    // Las imágenes (product_images) se borran por cascade; limpia los archivos huérfanos.
    await this.media.cleanupOrphans(links.map((l) => l.assetId));
  }

  async duplicate(id: string): Promise<ProductDetail> {
    const src = await this.findOne(id);
    const dto: CreateProductDto = {
      name: `Copia de ${src.name}`,
      status: ProductStatus.draft,
      hasVariants: src.hasVariants,
      sortOrder: src.sortOrder,
      featured: src.featured,
      description: src.description ?? undefined,
      shortDescription: src.shortDescription ?? undefined,
      metaTitle: src.metaTitle ?? undefined,
      metaDescription: src.metaDescription ?? undefined,
      categoryIds: src.categories.map((c) => c.id),
      optionTypes: src.optionTypes.map((ot) => ({
        name: ot.name,
        sortOrder: ot.sortOrder,
        values: ot.values.map((v) => v.value),
      })),
      variants: src.variants.map((v) => ({
        sku: undefined, // evita conflicto de SKU único
        price: v.price,
        comparePrice: v.comparePrice ?? undefined,
        costPrice: v.costPrice ?? undefined,
        stock: v.stock,
        stockPolicy: v.stockPolicy,
        weight: v.weight ?? undefined,
        color: v.color ?? undefined,
        imageAssetId: v.imageAssetId ?? undefined,
        isDefault: v.isDefault,
        active: v.active,
        sortOrder: v.sortOrder,
        options: v.options.map((o) => ({ optionType: o.optionType, value: o.value })),
      })),
      // Biblioteca compartida: la copia reutiliza los mismos assets (sin duplicar archivos).
      images: src.images.map((img) => ({
        assetId: img.assetId,
        altText: img.altText ?? undefined,
        sortOrder: img.sortOrder,
        isCover: img.isCover,
      })),
    };
    return this.create(dto);
  }

  async reorder(items: ReorderItemDto[]): Promise<void> {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.product.update({ where: { id: it.id }, data: { sortOrder: it.sortOrder } }),
      ),
    );
  }

  // ----------------------------- escritura -----------------------------

  private async writeOptionsAndVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    optionTypes: OptionTypeInputDto[] | undefined,
    variants: VariantInputDto[],
  ): Promise<void> {
    const valueIdByKey = new Map<string, string>();

    if (optionTypes?.length) {
      for (const [ti, ot] of optionTypes.entries()) {
        const createdType = await tx.optionType.create({
          data: { productId, name: ot.name, sortOrder: ot.sortOrder ?? ti },
        });
        for (const [vi, value] of ot.values.entries()) {
          const ov = await tx.optionValue.create({
            data: { optionTypeId: createdType.id, value, sortOrder: vi },
          });
          valueIdByKey.set(this.optKey(ot.name, value), ov.id);
        }
      }
    }

    for (const [vi, vr] of variants.entries()) {
      const variant = await tx.variant.create({
        data: {
          productId,
          sku: vr.sku ?? null,
          price: vr.price,
          comparePrice: vr.comparePrice ?? null,
          costPrice: vr.costPrice ?? null,
          stock: vr.stock ?? 0,
          stockPolicy: vr.stockPolicy ?? StockPolicy.deny,
          weight: vr.weight ?? null,
          color: vr.color ?? null,
          imageAssetId: vr.imageAssetId ?? null,
          isDefault: vr.isDefault ?? false,
          active: vr.active ?? true,
          sortOrder: vr.sortOrder ?? vi,
        },
      });
      for (const opt of vr.options ?? []) {
        const valueId = valueIdByKey.get(this.optKey(opt.optionType, opt.value));
        if (valueId) {
          await tx.variantOption.create({
            data: { variantId: variant.id, optionValueId: valueId },
          });
        }
      }
    }
  }

  /** Crea las filas product_images para un producto (la portada va primera). */
  private async writeImages(
    tx: Prisma.TransactionClient,
    productId: string,
    images: ProductImageInputDto[],
  ): Promise<void> {
    for (const [i, img] of images.entries()) {
      await tx.productImage.create({
        data: {
          productId,
          assetId: img.assetId,
          altText: img.altText ?? null,
          sortOrder: i,
          isCover: i === 0,
        },
      });
    }
  }

  /**
   * Normaliza la lista de imágenes: deduplica por assetId, coloca la portada
   * primera y reasigna sortOrder secuencial. La primera imagen es la portada.
   */
  private normalizeImages(images: ProductImageInputDto[] | undefined): ProductImageInputDto[] {
    if (!images?.length) {
      return [];
    }
    const seen = new Set<string>();
    const unique = images.filter((img) => {
      if (seen.has(img.assetId)) {
        return false;
      }
      seen.add(img.assetId);
      return true;
    });
    const ordered = [...unique].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const coverIdx = ordered.findIndex((img) => img.isCover);
    if (coverIdx > 0) {
      const [cover] = ordered.splice(coverIdx, 1);
      ordered.unshift(cover);
    }
    return ordered.map((img, i) => ({ ...img, sortOrder: i, isCover: i === 0 }));
  }

  /**
   * Descarta los punteros variante→imagen que no correspondan a una imagen del
   * producto (p. ej. la imagen se quitó en el mismo guardado). Así la galería de
   * la tienda nunca recibe un asset que no está en su lista.
   */
  private normalizeVariantImages(
    variants: VariantInputDto[],
    allowedAssetIds: string[],
  ): VariantInputDto[] {
    const allowed = new Set(allowedAssetIds);
    return variants.map((v) =>
      v.imageAssetId && !allowed.has(v.imageAssetId) ? { ...v, imageAssetId: undefined } : v,
    );
  }

  // ----------------------------- validación -----------------------------

  /** Garantiza exactamente 1 is_default (el primero marcado, o el primero). */
  private normalizeDefaults(variants: VariantInputDto[]): VariantInputDto[] {
    const idx = variants.findIndex((v) => v.isDefault);
    const defaultIndex = idx === -1 ? 0 : idx;
    return variants.map((v, i) => ({ ...v, isDefault: i === defaultIndex }));
  }

  private assertComparePrices(variants: VariantInputDto[]): void {
    for (const v of variants) {
      if (v.comparePrice != null && v.comparePrice <= v.price) {
        throw new BadRequestException('El precio comparado debe ser mayor que el precio.');
      }
    }
  }

  private assertPublishable(status: ProductStatus, variants: VariantInputDto[]): void {
    if (status !== ProductStatus.active) {
      return;
    }
    const active = variants.filter((v) => v.active ?? true);
    if (active.length === 0) {
      throw new BadRequestException('Debe tener al menos una variante activa para publicar.');
    }
    if (!active.some((v) => v.price > 0)) {
      throw new BadRequestException('Las variantes activas deben tener precio mayor que 0.');
    }
  }

  // ----------------------------- helpers -----------------------------

  private optKey(typeName: string, value: string): string {
    return `${typeName}::${value}`;
  }

  private slugExists(slug: string, exceptId?: string): Promise<boolean> {
    return this.prisma.product
      .findFirst({
        where: { slug, ...(exceptId && { id: { not: exceptId } }) },
        select: { id: true },
      })
      .then((p) => p !== null);
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<string> {
    if (await this.slugExists(slug, exceptId)) {
      const suggestion = await uniqueSlug(slug, (s) => this.slugExists(s, exceptId));
      throw new ConflictException(`Slug en uso. Sugerencia: ${suggestion}`);
    }
    return slug;
  }

  private rethrow(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = e.meta?.target;
      const field = Array.isArray(target) ? target.join(',') : String(target ?? '');
      if (field.includes('sku')) {
        throw new ConflictException('El SKU ya está en uso.');
      }
      if (field.includes('slug')) {
        throw new ConflictException('El slug ya está en uso.');
      }
      throw new ConflictException('Valor único duplicado.');
    }
    throw e;
  }

  // ----------------------------- mapeo de respuesta -----------------------------

  private toListItem(p: ProductListRow): ProductListItem {
    const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    const stock = p.variants.filter((v) => v.active).reduce((s, v) => s + v.stock, 0);
    const cover = p.images[0]?.asset;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      featured: p.featured,
      hasVariants: p.hasVariants,
      sortOrder: p.sortOrder,
      updatedAt: p.updatedAt,
      coverImageUrl: cover?.thumbnailUrl ?? cover?.url ?? null,
      price: defaultVariant ? Number(defaultVariant.price) : null,
      sku: p.hasVariants
        ? p.variants.length > 1
          ? 'Múltiples'
          : (defaultVariant?.sku ?? null)
        : (defaultVariant?.sku ?? null),
      stock,
      categories: p.categories,
    };
  }

  private toDetail(p: ProductDetailRow): ProductDetail {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      status: p.status,
      hasVariants: p.hasVariants,
      sortOrder: p.sortOrder,
      featured: p.featured,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      categories: p.categories,
      images: p.images.map((img) => ({
        id: img.id,
        assetId: img.assetId,
        url: img.asset.url,
        thumbnailUrl: img.asset.thumbnailUrl,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isCover: img.isCover,
        width: img.asset.width,
        height: img.asset.height,
      })),
      optionTypes: p.optionTypes.map((ot) => ({
        id: ot.id,
        name: ot.name,
        sortOrder: ot.sortOrder,
        values: ot.values.map((v) => ({ id: v.id, value: v.value, sortOrder: v.sortOrder })),
      })),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        comparePrice: v.comparePrice != null ? Number(v.comparePrice) : null,
        costPrice: v.costPrice != null ? Number(v.costPrice) : null,
        stock: v.stock,
        stockPolicy: v.stockPolicy,
        weight: v.weight != null ? Number(v.weight) : null,
        color: v.color,
        imageAssetId: v.imageAssetId,
        isDefault: v.isDefault,
        active: v.active,
        sortOrder: v.sortOrder,
        options: v.options.map((o) => ({
          optionType: o.optionValue.optionType.name,
          value: o.optionValue.value,
          optionValueId: o.optionValueId,
        })),
      })),
    };
  }
}

// --------------------------------- tipos ---------------------------------

type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof DETAIL_INCLUDE }>;

type ProductListRow = Prisma.ProductGetPayload<{
  include: {
    categories: { select: { id: true; name: true } };
    images: { select: { asset: { select: { url: true; thumbnailUrl: true } } } };
    variants: { select: { price: true; sku: true; stock: true; active: true; isDefault: true } };
  };
}>;

export interface ProductImageView {
  id: string;
  assetId: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  featured: boolean;
  hasVariants: boolean;
  sortOrder: number;
  updatedAt: Date;
  coverImageUrl: string | null;
  price: number | null;
  sku: string | null;
  stock: number;
  categories: { id: string; name: string }[];
}

export interface ProductVariantView {
  id: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
  stockPolicy: StockPolicy;
  weight: number | null;
  color: string | null;
  /** Imagen del producto a la que salta la galería al elegir la variante. */
  imageAssetId: string | null;
  isDefault: boolean;
  active: boolean;
  sortOrder: number;
  options: { optionType: string; value: string; optionValueId: string }[];
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  status: ProductStatus;
  hasVariants: boolean;
  sortOrder: number;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: { id: string; name: string; slug: string }[];
  images: ProductImageView[];
  optionTypes: {
    id: string;
    name: string;
    sortOrder: number;
    values: { id: string; value: string; sortOrder: number }[];
  }[];
  variants: ProductVariantView[];
}
