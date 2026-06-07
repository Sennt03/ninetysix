import { Injectable, Logger } from '@nestjs/common';
import { ImportJob, ImportRowAction, ImportRowStatus, Prisma } from '@prisma/client';
import { slugify } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { ImportJobsService } from './import-jobs.service';
import { PRODUCT_COLUMNS, LIMITS } from './import.constants';
import { ImportPreview, ParsedProductItem, ParsedVariant, PreviewRow } from './import.types';
import {
  parseBool,
  parseColor,
  parseDecimal,
  parseIntField,
  parseProductStatus,
  parseStockPolicy,
  splitList,
} from './parse.util';
import { RawRow, readSheetRows } from './xlsx.util';

/**
 * Importación de productos desde un .xlsx (hoja única estilo Shopify: filas con
 * el mismo Handle = un producto). Agrupa, valida y delega la escritura en
 * ProductsService (una transacción por producto). Ver 04.carga_masiva.md.
 */
@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly media: MediaService,
    private readonly jobs: ImportJobsService,
  ) {}

  // ------------------------------- preview -------------------------------

  async preview(source: string | Buffer): Promise<ImportPreview> {
    const rows = await readSheetRows(source, PRODUCT_COLUMNS);
    const items = this.buildItems(rows);
    const previewRows: PreviewRow[] = items.slice(0, LIMITS.previewCap).map((it) => ({
      _row: it.firstRow,
      _errors: it.errors,
      handle: it.handle || null,
      name: it.name ?? null,
      status: it.status ?? 'draft',
      variants: it.variants.length,
      images: it.images.length,
      categories: it.categorySlugs.join(', ') || null,
      price: it.variants.find((v) => v.price != null)?.price ?? null,
    }));
    return {
      type: 'products',
      totalRows: rows.length,
      totalItems: items.length,
      validItems: items.filter((i) => i.errors.length === 0).length,
      invalidItems: items.filter((i) => i.errors.length > 0).length,
      truncated: items.length > LIMITS.previewCap,
      columns: [
        { key: 'handle', header: 'Handle' },
        { key: 'name', header: 'Nombre' },
        { key: 'status', header: 'Estado' },
        { key: 'variants', header: 'Variantes' },
        { key: 'images', header: 'Imágenes' },
        { key: 'categories', header: 'Categorías' },
        { key: 'price', header: 'Precio' },
      ],
      rows: previewRows,
    };
  }

  // ------------------------------ ejecución ------------------------------

  async run(job: ImportJob): Promise<void> {
    const rows = await readSheetRows(job.filePath, PRODUCT_COLUMNS);
    const items = this.buildItems(rows);
    await this.jobs.markProcessing(job.id, items.length);

    for (const item of items) {
      if (item.errors.length) {
        await this.jobs.recordRow(job.id, {
          rowNumber: item.firstRow,
          identifier: item.handle || null,
          status: ImportRowStatus.error,
          message: item.errors.join(' · '),
          rawData: this.rawForError(item),
        });
        continue;
      }
      try {
        const { action, warning } = await this.executeItem(item);
        await this.jobs.recordRow(job.id, {
          rowNumber: item.firstRow,
          identifier: item.handle,
          status: ImportRowStatus.ok,
          action,
          message: warning ?? null,
          rawData: warning ? this.rawForError(item) : undefined,
        });
      } catch (e) {
        await this.jobs.recordRow(job.id, {
          rowNumber: item.firstRow,
          identifier: item.handle,
          status: ImportRowStatus.error,
          message: (e as Error).message,
          rawData: this.rawForError(item),
        });
      }
    }
    await this.jobs.finalize(job.id);
  }

  /** Crea o actualiza un producto a partir del item parseado. */
  private async executeItem(
    item: ParsedProductItem,
  ): Promise<{ action: ImportRowAction; warning?: string }> {
    const slug = item.slug || slugify(item.handle);

    // Categorías: resolver slugs -> ids (deben existir).
    const categoryIds = await this.resolveCategories(item.categorySlugs);

    // Imágenes por URL: descargar (dedup por hash). Fallos -> aviso, no rompe.
    const failedImages: string[] = [];
    const newImages: { assetId: string; altText?: string }[] = [];
    for (const img of item.images) {
      try {
        const assetId = await this.media.importFromUrl(img.url);
        newImages.push({ assetId, altText: img.alt });
      } catch (e) {
        failedImages.push(`${img.url} (${(e as Error).message})`);
      }
    }

    const existing = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    const dto: CreateProductDto = {
      name: item.name!,
      slug,
      description: item.description,
      shortDescription: item.shortDescription,
      status: item.status,
      featured: item.featured,
      hasVariants: item.hasVariants,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      categoryIds,
      optionTypes: item.hasVariants ? item.optionTypes : undefined,
      variants: item.variants.map((v) => this.toVariantDto(v)),
      images: await this.buildImages(existing?.id, newImages),
    };

    if (existing) {
      await this.products.update(existing.id, dto);
      return { action: ImportRowAction.updated, warning: this.imagesWarning(failedImages) };
    }
    await this.products.create(dto);
    return { action: ImportRowAction.created, warning: this.imagesWarning(failedImages) };
  }

  private imagesWarning(failed: string[]): string | undefined {
    return failed.length ? `Imágenes no importadas: ${failed.join('; ')}` : undefined;
  }

  private toVariantDto(v: ParsedVariant): CreateProductDto['variants'][number] {
    return {
      sku: v.sku,
      price: v.price ?? 0,
      comparePrice: v.comparePrice,
      costPrice: v.costPrice,
      stock: v.stock,
      stockPolicy: v.stockPolicy,
      weight: v.weight,
      color: v.color,
      isDefault: v.isDefault,
      active: v.active,
      options: v.options,
    };
  }

  /** Imágenes para el dto: en update conserva las existentes y añade las nuevas. */
  private async buildImages(
    productId: string | undefined,
    newImages: { assetId: string; altText?: string }[],
  ): Promise<CreateProductDto['images']> {
    const result: { assetId: string; altText?: string }[] = [];
    const seen = new Set<string>();
    if (productId) {
      const current = await this.prisma.productImage.findMany({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
        select: { assetId: true, altText: true },
      });
      for (const c of current) {
        if (!seen.has(c.assetId)) {
          seen.add(c.assetId);
          result.push({ assetId: c.assetId, altText: c.altText ?? undefined });
        }
      }
    }
    for (const img of newImages) {
      if (!seen.has(img.assetId)) {
        seen.add(img.assetId);
        result.push(img);
      }
    }
    return result.length ? result.slice(0, 20) : undefined;
  }

  private async resolveCategories(slugs: string[]): Promise<string[] | undefined> {
    if (!slugs.length) {
      return undefined;
    }
    const found = await this.prisma.category.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(found.map((c) => [c.slug, c.id]));
    const missing = slugs.filter((s) => !bySlug.has(s));
    if (missing.length) {
      throw new Error(`Categorías no encontradas: ${missing.join(', ')}`);
    }
    return slugs.map((s) => bySlug.get(s)!);
  }

  // ------------------------------- parseo --------------------------------

  /** Agrupa las filas por Handle (sin Handle = fila propia) y construye items. */
  private buildItems(rows: RawRow[]): ParsedProductItem[] {
    const groups = new Map<string, RawRow[]>();
    const order: string[] = [];
    for (const row of rows) {
      const handle = (row.values.handle ?? '').trim();
      const key = handle || `__row_${row.rowNumber}`;
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(row);
    }
    return order.map((key) => this.buildItem(groups.get(key)!));
  }

  private buildItem(rows: RawRow[]): ParsedProductItem {
    const errors: string[] = [];
    const tryParse = <T>(fn: () => T): T | undefined => {
      try {
        return fn();
      } catch (e) {
        errors.push((e as Error).message);
        return undefined;
      }
    };

    const first = rows[0];
    const handle = (first.values.handle ?? '').trim();
    if (!handle) {
      errors.push('Falta el Handle (columna obligatoria que agrupa el producto).');
    }
    const name = first.values.name?.trim();
    if (!name) {
      errors.push('Falta el Nombre (obligatorio en la primera fila del producto).');
    }

    // Imágenes acumuladas en orden de aparición, deduplicadas por URL.
    const images: { url: string; alt?: string }[] = [];
    const seenUrls = new Set<string>();
    for (const row of rows) {
      for (const url of splitList(row.values.imageUrl)) {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          images.push({ url, alt: row.values.imageAlt });
        }
      }
    }

    // Variantes: una fila es variante si tiene Precio o algún valor de opción.
    const variants: ParsedVariant[] = [];
    for (const row of rows) {
      const v = row.values;
      const options: { optionType: string; value: string }[] = [];
      for (const i of [1, 2, 3]) {
        const optName = v[`option${i}Name`]?.trim();
        const optVal = v[`option${i}Value`]?.trim();
        if (optVal) {
          if (!optName) {
            errors.push(`Fila ${row.rowNumber}: Opción${i} tiene valor pero falta el nombre.`);
          } else {
            options.push({ optionType: optName, value: optVal });
          }
        }
      }
      const hasPrice = !!v.price?.trim();
      if (!hasPrice && options.length === 0) {
        continue; // fila solo-imagen
      }
      const price = tryParse(() => parseDecimal(v.price, 'Precio'));
      if (price == null) {
        errors.push(`Fila ${row.rowNumber}: falta el Precio de la variante.`);
      }
      variants.push({
        rowNumber: row.rowNumber,
        sku: v.sku?.trim() || undefined,
        price,
        comparePrice: tryParse(() => parseDecimal(v.comparePrice, 'Precio comparado')),
        costPrice: tryParse(() => parseDecimal(v.costPrice, 'Costo')),
        stock: tryParse(() => parseIntField(v.stock, 'Stock')),
        stockPolicy: tryParse(() => parseStockPolicy(v.stockPolicy)),
        weight: tryParse(() => parseDecimal(v.weight, 'Peso')),
        color: tryParse(() => parseColor(v.color)),
        isDefault: tryParse(() => parseBool(v.isDefault)),
        active: tryParse(() => parseBool(v.active)),
        options,
      });
    }

    if (variants.length === 0) {
      errors.push('El producto no tiene ninguna variante con Precio.');
    }
    const hasVariants = variants.some((v) => v.options.length > 0);
    if (!hasVariants && variants.length > 1) {
      errors.push('Hay varias filas pero sin columnas de Opción para diferenciarlas.');
    }

    // Tipos de opción (orden de aparición, valores únicos).
    const typeOrder: string[] = [];
    const valuesByType = new Map<string, string[]>();
    for (const variant of variants) {
      for (const o of variant.options) {
        if (!valuesByType.has(o.optionType)) {
          valuesByType.set(o.optionType, []);
          typeOrder.push(o.optionType);
        }
        const arr = valuesByType.get(o.optionType)!;
        if (!arr.includes(o.value)) {
          arr.push(o.value);
        }
      }
    }
    if (typeOrder.length > 3) {
      errors.push('Máximo 3 tipos de opción por producto.');
    }
    const optionTypes = typeOrder.map((n) => ({ name: n, values: valuesByType.get(n)! }));

    return {
      handle,
      firstRow: first.rowNumber,
      rowNumbers: rows.map((r) => r.rowNumber),
      name,
      slug: first.values.slug?.trim() || undefined,
      description: first.values.description?.trim() || undefined,
      shortDescription: first.values.shortDescription?.trim() || undefined,
      status: tryParse(() => parseProductStatus(first.values.status)),
      featured: tryParse(() => parseBool(first.values.featured)),
      metaTitle: first.values.metaTitle?.trim() || undefined,
      metaDescription: first.values.metaDescription?.trim() || undefined,
      categorySlugs: splitList(first.values.categories),
      images,
      hasVariants,
      optionTypes,
      variants,
      errors,
      raw: rows,
    };
  }

  /** rawData para el archivo de fallidas: filas originales con cabeceras canónicas. */
  private rawForError(item: ParsedProductItem): Prisma.InputJsonValue {
    const headerByKey = new Map(PRODUCT_COLUMNS.map((c) => [c.key, c.header]));
    const subRows = item.raw.map((r) => {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(r.values)) {
        out[headerByKey.get(key) ?? key] = value;
      }
      return out;
    });
    return { __rows: subRows };
  }
}
