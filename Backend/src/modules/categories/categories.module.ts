import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

/**
 * Módulo de categorías. Relacional (Prisma). Solo se carga con BD SQL,
 * gestionado por AppModule mediante isSql(). PrismaService es global.
 * Importa MediaModule para resolver/limpiar la imagen (asset) de la categoría.
 */
@Module({
  imports: [MediaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
