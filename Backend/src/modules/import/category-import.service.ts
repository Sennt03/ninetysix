import { Injectable } from '@nestjs/common';
import { CategoryStatus, ImportJob, ImportRowAction, ImportRowStatus, Prisma } from '@prisma/client';
import { slugify } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { ImportJobsService } from './import-jobs.service';
import { CATEGORY_COLUMNS, LIMITS } from './import.constants';
import { ImportPreview, PreviewRow } from './import.types';
import { parseCategoryStatus, parseIntField } from './parse.util';
import { RawRow, readSheetRows } from './xlsx.util';

interface ParsedCategoryItem {
  rowNumber: number;
  name?: string;
  slug?: string;
  description?: string;
  parentSlug?: string;
  imageUrl?: string;
  imageAlt?: string;
  status?: CategoryStatus;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  errors: string[];
  raw: RawRow;
}

/**
 * Importación de categorías desde un .xlsx (una fila = una categoría).
 * Dos pasadas: 1) crear/actualizar por slug; 2) enlazar el padre por slug
 * (permite que el padre aparezca en una fila posterior). Ver 04.carga_masiva.md.
 */
@Injectable()
export class CategoryImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
    private readonly media: MediaService,
    private readonly jobs: ImportJobsService,
  ) {}

  async preview(source: string | Buffer): Promise<ImportPreview> {
    const rows = await readSheetRows(source, CATEGORY_COLUMNS);
    const items = rows.map((r) => this.buildItem(r));
    const previewRows: PreviewRow[] = items.slice(0, LIMITS.previewCap).map((it) => ({
      _row: it.rowNumber,
      _errors: it.errors,
      name: it.name ?? null,
      slug: it.slug ?? (it.name ? slugify(it.name) : null),
      parent: it.parentSlug ?? null,
      status: it.status ?? 'active',
      image: it.imageUrl ? 'sí' : 'no',
    }));
    return {
      type: 'categories',
      totalRows: rows.length,
      totalItems: items.length,
      validItems: items.filter((i) => i.errors.length === 0).length,
      invalidItems: items.filter((i) => i.errors.length > 0).length,
      truncated: items.length > LIMITS.previewCap,
      columns: [
        { key: 'name', header: 'Nombre' },
        { key: 'slug', header: 'Slug' },
        { key: 'parent', header: 'Padre' },
        { key: 'status', header: 'Estado' },
        { key: 'image', header: 'Imagen' },
      ],
      rows: previewRows,
    };
  }

  async run(job: ImportJob): Promise<void> {
    const rows = await readSheetRows(job.filePath, CATEGORY_COLUMNS);
    const items = rows.map((r) => this.buildItem(r));
    await this.jobs.markProcessing(job.id, items.length);

    // Pass 1: crear/actualizar (sin padre todavía).
    const results = new Map<
      ParsedCategoryItem,
      { id?: string; action: ImportRowAction; status: ImportRowStatus; message?: string }
    >();
    for (const item of items) {
      if (item.errors.length) {
        results.set(item, {
          action: ImportRowAction.none,
          status: ImportRowStatus.error,
          message: item.errors.join(' · '),
        });
        continue;
      }
      try {
        const { id, action } = await this.upsert(item);
        results.set(item, { id, action, status: ImportRowStatus.ok });
      } catch (e) {
        results.set(item, {
          action: ImportRowAction.none,
          status: ImportRowStatus.error,
          message: (e as Error).message,
        });
      }
    }

    // Pass 2: enlazar padres por slug.
    const parentSlugs = [...new Set(items.map((i) => i.parentSlug).filter(Boolean))] as string[];
    if (parentSlugs.length) {
      const parents = await this.prisma.category.findMany({
        where: { slug: { in: parentSlugs } },
        select: { id: true, slug: true },
      });
      const parentMap = new Map(parents.map((p) => [p.slug, p.id]));
      for (const item of items) {
        const res = results.get(item)!;
        if (res.status !== ImportRowStatus.ok || !item.parentSlug || !res.id) {
          continue;
        }
        const parentId = parentMap.get(item.parentSlug);
        if (!parentId) {
          res.message = `Categoría padre no encontrada: ${item.parentSlug}`;
          continue;
        }
        try {
          await this.categories.update(res.id, { parentId });
        } catch (e) {
          res.message = `No se pudo asignar el padre: ${(e as Error).message}`;
        }
      }
    }

    // Registrar incidencias.
    for (const item of items) {
      const res = results.get(item)!;
      await this.jobs.recordRow(job.id, {
        rowNumber: item.rowNumber,
        identifier: item.slug ?? item.name ?? null,
        status: res.status,
        action: res.action,
        message: res.message ?? null,
        rawData: res.status === ImportRowStatus.error || res.message ? this.rawForError(item) : undefined,
      });
    }
    await this.jobs.finalize(job.id);
  }

  private async upsert(
    item: ParsedCategoryItem,
  ): Promise<{ id: string; action: ImportRowAction }> {
    const slug = item.slug || slugify(item.name!);
    const imageAssetId = item.imageUrl ? await this.media.importFromUrl(item.imageUrl) : undefined;

    const dto: CreateCategoryDto = {
      name: item.name!,
      slug,
      description: item.description,
      ...(imageAssetId && { imageAssetId, imageAlt: item.imageAlt || item.name! }),
      status: item.status,
      sortOrder: item.sortOrder,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
    };

    const existing = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      await this.categories.update(existing.id, dto);
      return { id: existing.id, action: ImportRowAction.updated };
    }
    const created = await this.categories.create(dto);
    return { id: created.id, action: ImportRowAction.created };
  }

  private buildItem(row: RawRow): ParsedCategoryItem {
    const errors: string[] = [];
    const v = row.values;
    const name = v.name?.trim();
    if (!name) {
      errors.push('Falta el Nombre (columna obligatoria).');
    }
    let status: CategoryStatus | undefined;
    try {
      status = parseCategoryStatus(v.status);
    } catch (e) {
      errors.push((e as Error).message);
    }
    let sortOrder: number | undefined;
    try {
      sortOrder = parseIntField(v.sortOrder, 'Orden');
    } catch (e) {
      errors.push((e as Error).message);
    }
    const imageUrl = v.imageUrl?.trim() || undefined;
    if (imageUrl && !v.imageAlt?.trim()) {
      errors.push('La imagen requiere texto Alt (columna Imagen Alt).');
    }

    return {
      rowNumber: row.rowNumber,
      name,
      slug: v.slug?.trim() || undefined,
      description: v.description?.trim() || undefined,
      // El padre se referencia por slug; lo normalizamos igual que se generan
      // los slugs para tolerar que escriban el nombre ("Ropa" -> "ropa").
      parentSlug: v.parent?.trim() ? slugify(v.parent) : undefined,
      imageUrl,
      imageAlt: v.imageAlt?.trim() || undefined,
      status,
      sortOrder,
      metaTitle: v.metaTitle?.trim() || undefined,
      metaDescription: v.metaDescription?.trim() || undefined,
      errors,
      raw: row,
    };
  }

  private rawForError(item: ParsedCategoryItem): Prisma.InputJsonValue {
    const headerByKey = new Map(CATEGORY_COLUMNS.map((c) => [c.key, c.header]));
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(item.raw.values)) {
      out[headerByKey.get(key) ?? key] = value;
    }
    return out;
  }
}
