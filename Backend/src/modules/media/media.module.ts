import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaStorageService } from './media-storage.service';

/**
 * Biblioteca de archivos (imágenes). Relacional (Prisma), solo se carga con BD SQL.
 * Exporta MediaService para que products/categories puedan limpiar huérfanos y
 * validar assets al asociar imágenes.
 */
@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaStorageService],
  exports: [MediaService, MediaStorageService],
})
export class MediaModule {}
