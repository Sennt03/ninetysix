import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';

/**
 * Módulo de la tienda pública (storefront). Relacional (Prisma): solo se carga
 * con BD SQL, gestionado por AppModule mediante isSql(). PrismaService es global.
 * Expone endpoints públicos de solo lectura para el SSR del frontend.
 */
@Module({
  controllers: [StorefrontController],
  providers: [StorefrontService],
  exports: [StorefrontService],
})
export class StorefrontModule {}
