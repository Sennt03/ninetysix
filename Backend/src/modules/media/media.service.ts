import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAsset, Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaQueryDto } from './dto/media-query.dto';
import { MediaStorageService } from './media-storage.service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB (igual que la subida manual)

export interface MediaUsage {
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export interface MediaAssetView {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
  inUse: boolean;
  usageCount: number;
  /** Si al subir se detectó una imagen idéntica ya existente, su nombre (para avisar). */
  duplicateOfName?: string | null;
}

export interface MediaAssetDetail extends MediaAssetView {
  usage: MediaUsage;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
  ) {}

  async list(query: MediaQueryDto): Promise<PaginatedResult<MediaAssetView>> {
    const { page, limit, skip } = query;
    const where: Prisma.MediaAssetWhereInput = {
      ...(query.search && { originalName: { contains: query.search } }),
      ...(query.usage === 'used' && {
        OR: [{ productLinks: { some: {} } }, { categories: { some: {} } }],
      }),
      ...(query.usage === 'unused' && {
        productLinks: { none: {} },
        categories: { none: {} },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { productLinks: true, categories: true } } },
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return {
      items: items.map((a) => this.toView(a, a._count.productLinks + a._count.categories)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  /** Procesa y guarda uno o varios archivos, creando un MediaAsset por cada uno. */
  async upload(files: Express.Multer.File[]): Promise<MediaAssetView[]> {
    const created: MediaAssetView[] = [];
    for (const file of files) {
      const { asset, duplicateOfName } = await this.persistBuffer(
        file.buffer,
        file.originalname ?? null,
      );
      // Asset recién creado: aún no está en uso (usageCount 0). Si el contenido ya
      // existía, `duplicateOfName` lleva el nombre de la copia previa para avisar.
      created.push({ ...this.toView(asset, 0), duplicateOfName });
    }
    return created;
  }

  /**
   * Crea (o reutiliza por hash) un asset a partir de un buffer y devuelve su id.
   * Lo usa la carga masiva (imágenes por URL o por ZIP).
   */
  async findOrCreateAssetFromBuffer(buffer: Buffer, originalName: string | null): Promise<string> {
    const { asset } = await this.persistBuffer(buffer, originalName);
    return asset.id;
  }

  /**
   * Descarga una imagen desde una URL pública, la valida/recomprime (sharp) y
   * crea/reutiliza el asset. Devuelve el id. Lanza BadRequest si la URL falla,
   * no es imagen o supera el límite de tamaño.
   */
  async importFromUrl(url: string): Promise<string> {
    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
    } catch {
      throw new BadRequestException(`No se pudo descargar la imagen: ${url}`);
    }
    if (!res.ok) {
      throw new BadRequestException(`No se pudo descargar la imagen (HTTP ${res.status}): ${url}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0) {
      throw new BadRequestException(`La descarga está vacía: ${url}`);
    }
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new BadRequestException(`La imagen supera 5 MB: ${url}`);
    }
    // No nos fiamos del content-type: sharp valida los magic bytes al procesar.
    const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'image');
    return this.findOrCreateAssetFromBuffer(buffer, name);
  }

  /**
   * Persiste un buffer como un asset NUEVO (ya NO deduplica: cada subida crea su
   * propio archivo aunque el contenido sea idéntico). Aun así detecta si ya existe
   * otra imagen con el mismo contenido (sha256) para poder avisar: devuelve
   * `duplicateOfName` con el nombre de la copia previa, o null si no la hay.
   *
   * El campo `hash` es único, así que para permitir copias solo la PRIMERA imagen
   * de un contenido conserva su hash; las siguientes van con `hash: null`. Así se
   * pueden subir duplicados y a la vez seguir detectándolos contra esa primera.
   */
  private async persistBuffer(
    buffer: Buffer,
    originalName: string | null,
  ): Promise<{ asset: MediaAsset; duplicateOfName: string | null }> {
    const hash = createHash('sha256').update(buffer).digest('hex');
    const existing = await this.prisma.mediaAsset.findFirst({
      where: { hash },
      orderBy: { createdAt: 'asc' },
      select: { originalName: true },
    });
    const processed = await this.storage.processAndSave({
      buffer,
      originalname: originalName ?? undefined,
    } as Express.Multer.File);
    const data = {
      filename: processed.filename,
      originalName: processed.originalName,
      url: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
    };
    try {
      const asset = await this.prisma.mediaAsset.create({
        // Solo la primera copia guarda el hash (índice único); las demás, null.
        data: { ...data, hash: existing ? null : hash },
      });
      return { asset, duplicateOfName: existing?.originalName ?? null };
    } catch (e) {
      // Carrera: otra subida idéntica guardó el hash entre el findFirst y el
      // create. Reintenta guardando ESTA copia con hash null (es un duplicado).
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const first = await this.prisma.mediaAsset.findFirst({
          where: { hash },
          orderBy: { createdAt: 'asc' },
          select: { originalName: true },
        });
        const asset = await this.prisma.mediaAsset.create({ data: { ...data, hash: null } });
        return { asset, duplicateOfName: first?.originalName ?? existing?.originalName ?? null };
      }
      throw e;
    }
  }

  async findOne(id: string): Promise<MediaAssetDetail> {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        productLinks: { select: { product: { select: { id: true, name: true } } } },
        categories: { select: { id: true, name: true } },
      },
    });
    if (!asset) {
      throw new NotFoundException('Archivo no encontrado');
    }
    const usage: MediaUsage = {
      products: asset.productLinks.map((l) => l.product),
      categories: asset.categories.map((c) => ({ id: c.id, name: c.name })),
    };
    const usageCount = usage.products.length + usage.categories.length;
    return { ...this.toView(asset, usageCount), usage };
  }

  /** Borra un archivo de la biblioteca. Bloqueado si está usado en producto/categoría. */
  async remove(id: string): Promise<void> {
    const detail = await this.findOne(id);
    if (detail.usage.products.length || detail.usage.categories.length) {
      throw new ConflictException({
        message: this.usageMessage(detail.usage),
        usage: detail.usage,
      });
    }
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return;
    }
    await this.prisma.mediaAsset.delete({ where: { id } });
    await this.storage.deleteFiles(asset);
  }

  /**
   * Borra del disco y de la BD los assets indicados que hayan quedado sin
   * referencias (ni productos ni categorías). Reutilizado por products/categories
   * tras desvincular imágenes.
   */
  async cleanupOrphans(assetIds: string[]): Promise<void> {
    const unique = [...new Set(assetIds.filter(Boolean))];
    for (const id of unique) {
      const asset = await this.prisma.mediaAsset.findUnique({
        where: { id },
        include: { _count: { select: { productLinks: true, categories: true } } },
      });
      if (!asset) {
        continue;
      }
      if (asset._count.productLinks + asset._count.categories === 0) {
        await this.prisma.mediaAsset.delete({ where: { id } });
        await this.storage.deleteFiles(asset);
      }
    }
  }

  /** Verifica que todos los ids existan; lanza si alguno falta. */
  async assertAssetsExist(assetIds: string[]): Promise<void> {
    const unique = [...new Set(assetIds)];
    if (unique.length === 0) {
      return;
    }
    const count = await this.prisma.mediaAsset.count({ where: { id: { in: unique } } });
    if (count !== unique.length) {
      throw new NotFoundException('Alguna de las imágenes seleccionadas no existe.');
    }
  }

  private usageMessage(usage: MediaUsage): string {
    const parts: string[] = [];
    if (usage.products.length) {
      parts.push(`producto(s): ${usage.products.map((p) => p.name).join(', ')}`);
    }
    if (usage.categories.length) {
      parts.push(`categoría(s): ${usage.categories.map((c) => c.name).join(', ')}`);
    }
    return `No se puede eliminar: la imagen está en uso por ${parts.join(' y ')}. Quítala desde ahí primero.`;
  }

  private toView(asset: MediaAsset, usageCount: number): MediaAssetView {
    return {
      id: asset.id,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      width: asset.width,
      height: asset.height,
      createdAt: asset.createdAt,
      inUse: usageCount > 0,
      usageCount,
    };
  }
}
