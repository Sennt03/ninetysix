import { BadRequestException, Injectable } from '@nestjs/common';
import { ImportJob, ImportRowAction, ImportRowStatus, Prisma } from '@prisma/client';
import { basename, extname } from 'node:path';
import unzipper from 'unzipper';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { ImportJobsService } from './import-jobs.service';
import { LIMITS } from './import.constants';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

interface ZipEntry {
  base: string; // nombre sin extensión
  filename: string;
  buffer: Buffer;
}

interface CodeMatch {
  code: string;
  order: number;
}

/**
 * Carga masiva de imágenes desde un .zip. Cada archivo se asocia a un producto
 * por el nombre = SKU de variante o slug (Handle). Sufijo numérico = orden:
 *   SER-01.jpg (portada), SER-01-2.jpg, SER-01-3.jpg …
 * Asociación aditiva: no toca las imágenes existentes. Ver 04.carga_masiva.md §4.
 */
@Injectable()
export class ImageImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly jobs: ImportJobsService,
  ) {}

  async run(job: ImportJob): Promise<void> {
    const entries = await this.readZip(job.filePath);

    // Candidatos de código: nombre completo y nombre sin sufijo numérico.
    const candidates = new Set<string>();
    for (const e of entries) {
      candidates.add(e.base);
      const stripped = this.stripSuffix(e.base);
      if (stripped) {
        candidates.add(stripped.code);
      }
    }
    const resolve = await this.buildResolver([...candidates]);

    // Agrupa entradas por producto resuelto; las no resueltas, por código.
    const byProduct = new Map<string, { code: string; items: (ZipEntry & CodeMatch)[] }>();
    const unresolved = new Map<string, ZipEntry[]>();
    for (const e of entries) {
      const match = this.matchCode(e.base, resolve);
      if (!match) {
        const arr = unresolved.get(e.base) ?? [];
        arr.push(e);
        unresolved.set(e.base, arr);
        continue;
      }
      const productId = resolve(match.code)!;
      const group = byProduct.get(productId) ?? { code: match.code, items: [] };
      group.items.push({ ...e, ...match });
      byProduct.set(productId, group);
    }

    await this.jobs.markProcessing(job.id, byProduct.size + unresolved.size);

    // Productos resueltos: asociar imágenes (aditivo).
    for (const [productId, group] of byProduct) {
      try {
        const added = await this.attachImages(productId, group.items);
        await this.jobs.recordRow(job.id, {
          rowNumber: 0,
          identifier: group.code,
          status: ImportRowStatus.ok,
          action: ImportRowAction.updated,
          message: added === 0 ? 'Las imágenes ya estaban asociadas.' : `${added} imagen(es) añadida(s).`,
        });
      } catch (e) {
        await this.jobs.recordRow(job.id, {
          rowNumber: 0,
          identifier: group.code,
          status: ImportRowStatus.error,
          message: (e as Error).message,
        });
      }
    }

    // No resueltas: una incidencia por código.
    for (const [code, items] of unresolved) {
      await this.jobs.recordRow(job.id, {
        rowNumber: 0,
        identifier: code,
        status: ImportRowStatus.error,
        message: `Sin producto para "${code}" (no coincide con ningún SKU ni slug). Archivos: ${items
          .map((i) => i.filename)
          .join(', ')}`,
      });
    }

    await this.jobs.finalize(job.id);
  }

  /** Crea/reutiliza los assets y los enlaza al producto sin tocar los previos. */
  private async attachImages(
    productId: string,
    items: (ZipEntry & CodeMatch)[],
  ): Promise<number> {
    const existing = await this.prisma.productImage.findMany({
      where: { productId },
      select: { assetId: true, sortOrder: true },
    });
    const existingAssetIds = new Set(existing.map((e) => e.assetId));
    const hadImages = existing.length > 0;
    let nextSort = existing.length ? Math.max(...existing.map((e) => e.sortOrder)) + 1 : 0;
    let added = 0;

    const ordered = [...items].sort((a, b) => a.order - b.order);
    for (const item of ordered) {
      const assetId = await this.media.findOrCreateAssetFromBuffer(item.buffer, item.filename);
      if (existingAssetIds.has(assetId)) {
        continue; // ya asociada a este producto
      }
      await this.prisma.productImage.create({
        data: {
          productId,
          assetId,
          sortOrder: nextSort,
          isCover: !hadImages && nextSort === 0,
        },
      });
      existingAssetIds.add(assetId);
      nextSort += 1;
      added += 1;
    }
    return added;
  }

  /** Resuelve un código (sku o slug) a productId. */
  private async buildResolver(codes: string[]): Promise<(code: string) => string | undefined> {
    if (!codes.length) {
      return () => undefined;
    }
    const [variants, products] = await Promise.all([
      this.prisma.variant.findMany({
        where: { sku: { in: codes } },
        select: { sku: true, productId: true },
      }),
      this.prisma.product.findMany({
        where: { slug: { in: codes } },
        select: { slug: true, id: true },
      }),
    ]);
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.slug, p.id);
    }
    for (const v of variants) {
      if (v.sku) {
        map.set(v.sku, v.productId); // el SKU tiene prioridad
      }
    }
    return (code: string) => map.get(code);
  }

  /** Determina código + orden para una entrada, probando nombre completo y sin sufijo. */
  private matchCode(base: string, resolve: (c: string) => string | undefined): CodeMatch | null {
    if (resolve(base)) {
      return { code: base, order: 1 };
    }
    const stripped = this.stripSuffix(base);
    if (stripped && resolve(stripped.code)) {
      return stripped;
    }
    return null;
  }

  /** "SER-01-2" -> { code: "SER-01", order: 2 }. null si no hay sufijo numérico. */
  private stripSuffix(base: string): CodeMatch | null {
    const m = base.match(/^(.*?)[ _-](\d+)$/);
    if (!m) {
      return null;
    }
    return { code: m[1], order: parseInt(m[2], 10) };
  }

  private async readZip(zipPath: string): Promise<ZipEntry[]> {
    let directory: unzipper.CentralDirectory;
    try {
      directory = await unzipper.Open.file(zipPath);
    } catch {
      throw new BadRequestException('No se pudo abrir el ZIP.');
    }
    const entries: ZipEntry[] = [];
    for (const file of directory.files) {
      if (file.type !== 'File') {
        continue;
      }
      const name = basename(file.path);
      if (!name || name.startsWith('.') || file.path.includes('__MACOSX')) {
        continue;
      }
      const ext = extname(name).toLowerCase();
      if (!IMAGE_EXT.has(ext)) {
        continue;
      }
      if (entries.length >= LIMITS.maxImages) {
        break;
      }
      const buffer = await file.buffer();
      entries.push({ base: name.slice(0, name.length - ext.length), filename: name, buffer });
    }
    if (entries.length === 0) {
      throw new BadRequestException('El ZIP no contiene imágenes (jpg, png, webp o gif).');
    }
    return entries;
  }
}
