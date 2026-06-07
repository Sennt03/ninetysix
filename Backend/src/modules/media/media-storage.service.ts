import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { AppConfig } from '../../config/configuration';

/** Datos derivados de un archivo procesado, listos para persistir como MediaAsset. */
export interface ProcessedAsset {
  filename: string;
  originalName: string | null;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

const MAX_DIMENSION = 2000; // lado máximo del archivo principal
const THUMB_SIZE = 400; // lado máximo del thumbnail
const THUMBS_SUBDIR = 'thumbs';

/**
 * Almacenamiento de imágenes en disco local. Usa `sharp` para validar que el
 * buffer sea realmente una imagen (magic bytes), recomprimir a webp y generar
 * un thumbnail de 400px. Los archivos se sirven estáticos bajo /uploads.
 */
@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);
  private readonly uploadDir: string;
  private readonly thumbsDir: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService<AppConfig, true>) {
    this.uploadDir = resolve(config.get('uploads.dir', { infer: true }));
    this.thumbsDir = join(this.uploadDir, THUMBS_SUBDIR);
    this.publicUrl = config.get('uploads.publicUrl', { infer: true }).replace(/\/+$/, '');
  }

  /** Procesa el buffer de un archivo subido y lo guarda (principal + thumbnail). */
  async processAndSave(file: Express.Multer.File): Promise<ProcessedAsset> {
    await this.ensureDirs();

    let pipeline: sharp.Sharp;
    let metadata: sharp.Metadata;
    try {
      pipeline = sharp(file.buffer, { animated: true });
      metadata = await pipeline.metadata();
    } catch {
      throw new BadRequestException('El archivo no es una imagen válida.');
    }
    if (!metadata.format || !metadata.width || !metadata.height) {
      throw new BadRequestException('El archivo no es una imagen válida.');
    }

    const isAnimated = (metadata.pages ?? 1) > 1;
    const id = randomUUID();

    // Animados (gif/webp animado) se conservan tal cual para no perder la animación.
    // El resto se reencoda a webp con un lado máximo de MAX_DIMENSION.
    let filename: string;
    let mimeType: string;
    let mainBuffer: Buffer;
    let outWidth = metadata.width;
    let outHeight = metadata.height;

    if (isAnimated) {
      filename = `${id}.${metadata.format === 'gif' ? 'gif' : 'webp'}`;
      mimeType = metadata.format === 'gif' ? 'image/gif' : 'image/webp';
      mainBuffer = file.buffer;
    } else {
      filename = `${id}.webp`;
      mimeType = 'image/webp';
      const resized = await sharp(file.buffer)
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      mainBuffer = resized.data;
      outWidth = resized.info.width;
      outHeight = resized.info.height;
    }

    const thumbFilename = `${id}.webp`;
    const thumbBuffer = await sharp(file.buffer, { animated: false })
      .rotate()
      .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await writeFile(join(this.uploadDir, filename), mainBuffer);
    await writeFile(join(this.thumbsDir, thumbFilename), thumbBuffer);

    return {
      filename,
      originalName: file.originalname ?? null,
      url: `${this.publicUrl}/uploads/${filename}`,
      thumbnailUrl: `${this.publicUrl}/uploads/${THUMBS_SUBDIR}/${thumbFilename}`,
      mimeType,
      sizeBytes: mainBuffer.byteLength,
      width: outWidth,
      height: outHeight,
    };
  }

  /** Elimina del disco el archivo principal y su thumbnail (ignora inexistentes). */
  async deleteFiles(asset: { filename: string }): Promise<void> {
    const id = asset.filename.replace(/\.[^.]+$/, '');
    await Promise.all([
      this.safeUnlink(join(this.uploadDir, asset.filename)),
      this.safeUnlink(join(this.thumbsDir, `${id}.webp`)),
    ]);
  }

  private async ensureDirs(): Promise<void> {
    await mkdir(this.thumbsDir, { recursive: true });
  }

  private async safeUnlink(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        this.logger.warn(`No se pudo borrar ${path}: ${err.message}`);
      }
    }
  }
}
