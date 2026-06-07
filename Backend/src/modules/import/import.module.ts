import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { MediaModule } from '../media/media.module';
import { ProductsModule } from '../products/products.module';
import { CategoryImportService } from './category-import.service';
import { ExportService } from './export.service';
import { ImageImportService } from './image-import.service';
import { ImportController } from './import.controller';
import { ImportJobsService } from './import-jobs.service';
import { ImportWorkerService } from './import-worker.service';
import { ProductImportService } from './product-import.service';
import { TemplateService } from './template.service';

/**
 * Carga masiva (import/export). Relacional (Prisma), solo se carga con BD SQL
 * (lo gestiona AppModule con isSql()). Reutiliza ProductsService/CategoriesService
 * para escribir y MediaService para descargar/deduplicar imágenes.
 * El worker procesa los jobs en segundo plano (sin Redis). Ver 04.carga_masiva.md.
 */
@Module({
  imports: [MediaModule, ProductsModule, CategoriesModule],
  controllers: [ImportController],
  providers: [
    ImportJobsService,
    ImportWorkerService,
    ProductImportService,
    CategoryImportService,
    ImageImportService,
    TemplateService,
    ExportService,
  ],
})
export class ImportModule {}
