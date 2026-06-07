import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImportJobType } from '@prisma/client';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ProductQueryDto } from '../products/dto/product-query.dto';
import { CategoryImportService } from './category-import.service';
import { ExportService } from './export.service';
import { ImageImportService } from './image-import.service';
import { ImportJobsQueryDto, ImportRowsQueryDto } from './dto/import-jobs-query.dto';
import { ImportJobsService } from './import-jobs.service';
import { ImportWorkerService } from './import-worker.service';
import { CATEGORY_COLUMNS, LIMITS, PRODUCT_COLUMNS } from './import.constants';
import { ProductImportService } from './product-import.service';
import { TemplateService } from './template.service';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Interceptor de subida para archivos .xlsx en memoria. */
const xlsxUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: LIMITS.xlsxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!/\.xlsx?$/i.test(file.originalname)) {
      cb(new BadRequestException('Sube un archivo Excel (.xlsx).'), false);
      return;
    }
    cb(null, true);
  },
});

/** Interceptor de subida para archivos .zip en memoria. */
const zipUpload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: LIMITS.zipBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!/\.zip$/i.test(file.originalname)) {
      cb(new BadRequestException('Sube un archivo ZIP con las imágenes.'), false);
      return;
    }
    cb(null, true);
  },
});

const fileBodySchema = {
  schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
};

@ApiTags('admin · carga masiva')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class ImportController {
  constructor(
    private readonly jobs: ImportJobsService,
    private readonly worker: ImportWorkerService,
    private readonly productImport: ProductImportService,
    private readonly categoryImport: CategoryImportService,
    private readonly imageImport: ImageImportService,
    private readonly templates: TemplateService,
    private readonly exporter: ExportService,
  ) {}

  // ----------------------------- IMPORTAR -----------------------------

  @Post('import/products/preview')
  @ApiOperation({ summary: 'Previsualiza un Excel de productos (sin crear job)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileBodySchema)
  @UseInterceptors(xlsxUpload)
  previewProducts(@UploadedFile() file: Express.Multer.File) {
    this.assertFile(file);
    return this.productImport.preview(file.buffer);
  }

  @Post('import/products')
  @ApiOperation({ summary: 'Importa productos desde un Excel (proceso asíncrono)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileBodySchema)
  @UseInterceptors(xlsxUpload)
  importProducts(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.startJob(ImportJobType.products, file, userId);
  }

  @Post('import/categories/preview')
  @ApiOperation({ summary: 'Previsualiza un Excel de categorías (sin crear job)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileBodySchema)
  @UseInterceptors(xlsxUpload)
  previewCategories(@UploadedFile() file: Express.Multer.File) {
    this.assertFile(file);
    return this.categoryImport.preview(file.buffer);
  }

  @Post('import/categories')
  @ApiOperation({ summary: 'Importa categorías desde un Excel (proceso asíncrono)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileBodySchema)
  @UseInterceptors(xlsxUpload)
  importCategories(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.startJob(ImportJobType.categories, file, userId);
  }

  @Post('import/images')
  @ApiOperation({ summary: 'Carga masiva de imágenes por ZIP (match por SKU/slug)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileBodySchema)
  @UseInterceptors(zipUpload)
  importImages(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.startJob(ImportJobType.images, file, userId);
  }

  // ------------------------- HISTORIAL / INCIDENCIAS -------------------------

  @Get('import/jobs')
  @ApiOperation({ summary: 'Historial de cargas masivas (paginado)' })
  history(@Query() query: ImportJobsQueryDto) {
    return this.jobs.history(query);
  }

  @Get('import/jobs/:id')
  @ApiOperation({ summary: 'Estado de un job (para polling)' })
  job(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobs.getJob(id);
  }

  @Get('import/jobs/:id/rows')
  @ApiOperation({ summary: 'Incidencias de un job (paginado, filtrable por estado)' })
  rows(@Param('id', ParseUUIDPipe) id: string, @Query() query: ImportRowsQueryDto) {
    return this.jobs.getRows(id, query);
  }

  @Get('import/jobs/:id/errors.xlsx')
  @ApiOperation({ summary: 'Descarga un Excel con solo las filas fallidas' })
  async errors(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const { buffer, filename } = await this.jobs.buildErrorsFile(id);
    return this.xlsx(buffer, filename);
  }

  @Get('import/columns/:type')
  @ApiOperation({ summary: 'Definición de columnas (para el diálogo de instrucciones)' })
  columns(@Param('type') type: string) {
    return type === 'categories' ? CATEGORY_COLUMNS : PRODUCT_COLUMNS;
  }

  // ----------------------------- PLANTILLAS -----------------------------

  @Get('import/template/products.xlsx')
  @ApiOperation({ summary: 'Plantilla de ejemplo para importar productos' })
  async templateProducts(): Promise<StreamableFile> {
    return this.xlsx(await this.templates.productsTemplate(), 'plantilla-productos.xlsx');
  }

  @Get('import/template/categories.xlsx')
  @ApiOperation({ summary: 'Plantilla de ejemplo para importar categorías' })
  async templateCategories(): Promise<StreamableFile> {
    return this.xlsx(await this.templates.categoriesTemplate(), 'plantilla-categorias.xlsx');
  }

  // ----------------------------- EXPORTAR -----------------------------

  @Get('export/products.xlsx')
  @ApiOperation({ summary: 'Exporta productos a Excel re-importable (acepta filtros)' })
  async exportProducts(@Query() query: ProductQueryDto): Promise<StreamableFile> {
    const buffer = await this.exporter.exportProducts({
      status: query.status,
      search: query.search,
      categoryId: query.categoryId,
      featured: query.featured,
      hasVariants: query.hasVariants,
    });
    return this.xlsx(buffer, 'productos.xlsx');
  }

  @Get('export/categories.xlsx')
  @ApiOperation({ summary: 'Exporta categorías a Excel re-importable' })
  async exportCategories(): Promise<StreamableFile> {
    return this.xlsx(await this.exporter.exportCategories(), 'categorias.xlsx');
  }

  // ------------------------------- helpers -------------------------------

  private async startJob(
    type: ImportJobType,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ jobId: string }> {
    this.assertFile(file);
    const job = await this.jobs.createJob(type, file, userId);
    this.worker.enqueue(job.id);
    return { jobId: job.id };
  }

  private assertFile(file: Express.Multer.File | undefined): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
  }

  private xlsx(buffer: Buffer, filename: string): StreamableFile {
    return new StreamableFile(buffer, {
      type: XLSX_MIME,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
