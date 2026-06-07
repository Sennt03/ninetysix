import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

/**
 * Módulo de productos. Relacional (Prisma). Solo se carga con BD SQL,
 * gestionado por AppModule mediante isSql(). PrismaService es global.
 * Importa MediaModule para asociar imágenes (assets) y limpiar huérfanos.
 */
@Module({
  imports: [MediaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
