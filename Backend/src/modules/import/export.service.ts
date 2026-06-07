import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CATEGORY_COLUMNS, ColumnDef, PRODUCT_COLUMNS } from './import.constants';
import { buildWorkbook, workbookToBuffer } from './xlsx.util';

const EXPORT_CAP = 10_000;

export interface ProductExportFilter {
  status?: ProductStatus[];
  search?: string;
  categoryId?: string;
  featured?: boolean;
  hasVariants?: boolean;
}

const PRODUCT_INCLUDE = {
  categories: { select: { slug: true } },
  images: { orderBy: { sortOrder: 'asc' }, include: { asset: { select: { url: true } } } },
  optionTypes: { orderBy: { sortOrder: 'asc' } },
  variants: {
    orderBy: { sortOrder: 'asc' },
    include: { options: { include: { optionValue: { include: { optionType: true } } } } },
  },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

/**
 * Exportación re-importable a .xlsx. El formato coincide con el de importación
 * (mismas cabeceras y agrupación por Handle), de modo que un export puede
 * volver a subirse sin tocar nada. Ver 04.carga_masiva.md §5.
 */
@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportProducts(filter: ProductExportFilter): Promise<Buffer> {
    const where: Prisma.ProductWhereInput = {
      ...(filter.status?.length && { status: { in: filter.status } }),
      ...(filter.featured !== undefined && { featured: filter.featured }),
      ...(filter.hasVariants !== undefined && { hasVariants: filter.hasVariants }),
      ...(filter.categoryId && { categories: { some: { id: filter.categoryId } } }),
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search } },
          { variants: { some: { sku: { contains: filter.search } } } },
        ],
      }),
    };
    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: EXPORT_CAP,
      include: PRODUCT_INCLUDE,
    });

    const rows: string[][] = [];
    for (const product of products) {
      rows.push(...this.productRows(product));
    }
    const wb = buildWorkbook('Productos', this.headers(PRODUCT_COLUMNS), rows);
    return workbookToBuffer(wb);
  }

  async exportCategories(): Promise<Buffer> {
    const cats = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { parent: { select: { slug: true } } },
    });
    const rows = cats.map((c) =>
      this.toRow(CATEGORY_COLUMNS, {
        name: c.name,
        slug: c.slug,
        description: c.description ?? '',
        parent: c.parent?.slug ?? '',
        imageUrl: c.imageUrl ?? '',
        imageAlt: c.imageAlt ?? '',
        status: c.status,
        sortOrder: String(c.sortOrder),
        metaTitle: c.metaTitle ?? '',
        metaDescription: c.metaDescription ?? '',
      }),
    );
    const wb = buildWorkbook('Categorías', this.headers(CATEGORY_COLUMNS), rows);
    return workbookToBuffer(wb);
  }

  /** Una fila por variante (estilo Shopify); datos de producto solo en la 1ª. */
  private productRows(product: ProductRow): string[][] {
    const imageUrls = product.images.map((img) => img.asset.url);
    const firstAlt = product.images[0]?.altText ?? '';

    return product.variants.map((variant, index) => {
      const rec: Record<string, string> = { handle: product.slug };
      if (index === 0) {
        rec.name = product.name;
        rec.slug = product.slug;
        rec.description = product.description ?? '';
        rec.shortDescription = product.shortDescription ?? '';
        rec.status = product.status;
        rec.featured = product.featured ? 'sí' : 'no';
        rec.categories = product.categories.map((c) => c.slug).join('|');
        rec.metaTitle = product.metaTitle ?? '';
        rec.metaDescription = product.metaDescription ?? '';
        rec.imageUrl = imageUrls.join('|');
        rec.imageAlt = firstAlt;
      }
      product.optionTypes.forEach((ot, oi) => {
        const match = variant.options.find((o) => o.optionValue.optionType.id === ot.id);
        rec[`option${oi + 1}Name`] = ot.name;
        rec[`option${oi + 1}Value`] = match?.optionValue.value ?? '';
      });
      rec.sku = variant.sku ?? '';
      rec.price = String(variant.price);
      rec.comparePrice = variant.comparePrice != null ? String(variant.comparePrice) : '';
      rec.costPrice = variant.costPrice != null ? String(variant.costPrice) : '';
      rec.stock = String(variant.stock);
      rec.stockPolicy = variant.stockPolicy;
      rec.weight = variant.weight != null ? String(variant.weight) : '';
      rec.color = variant.color ?? '';
      rec.isDefault = variant.isDefault ? 'sí' : 'no';
      rec.active = variant.active ? 'sí' : 'no';
      return this.toRow(PRODUCT_COLUMNS, rec);
    });
  }

  private headers(columns: ColumnDef[]): string[] {
    return columns.map((c) => c.header);
  }

  private toRow(columns: ColumnDef[], rec: Record<string, string>): string[] {
    return columns.map((c) => rec[c.key] ?? '');
  }
}
