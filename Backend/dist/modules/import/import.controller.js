"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const product_query_dto_1 = require("../products/dto/product-query.dto");
const category_import_service_1 = require("./category-import.service");
const export_service_1 = require("./export.service");
const image_import_service_1 = require("./image-import.service");
const import_jobs_query_dto_1 = require("./dto/import-jobs-query.dto");
const import_jobs_service_1 = require("./import-jobs.service");
const import_worker_service_1 = require("./import-worker.service");
const import_constants_1 = require("./import.constants");
const product_import_service_1 = require("./product-import.service");
const template_service_1 = require("./template.service");
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const xlsxUpload = (0, platform_express_1.FileInterceptor)('file', {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: import_constants_1.LIMITS.xlsxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!/\.xlsx?$/i.test(file.originalname)) {
            cb(new common_1.BadRequestException('Sube un archivo Excel (.xlsx).'), false);
            return;
        }
        cb(null, true);
    },
});
const zipUpload = (0, platform_express_1.FileInterceptor)('file', {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: import_constants_1.LIMITS.zipBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!/\.zip$/i.test(file.originalname)) {
            cb(new common_1.BadRequestException('Sube un archivo ZIP con las imágenes.'), false);
            return;
        }
        cb(null, true);
    },
});
const fileBodySchema = {
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
};
let ImportController = class ImportController {
    constructor(jobs, worker, productImport, categoryImport, imageImport, templates, exporter) {
        this.jobs = jobs;
        this.worker = worker;
        this.productImport = productImport;
        this.categoryImport = categoryImport;
        this.imageImport = imageImport;
        this.templates = templates;
        this.exporter = exporter;
    }
    previewProducts(file) {
        this.assertFile(file);
        return this.productImport.preview(file.buffer);
    }
    importProducts(file, userId) {
        return this.startJob(client_1.ImportJobType.products, file, userId);
    }
    previewCategories(file) {
        this.assertFile(file);
        return this.categoryImport.preview(file.buffer);
    }
    importCategories(file, userId) {
        return this.startJob(client_1.ImportJobType.categories, file, userId);
    }
    importImages(file, userId) {
        return this.startJob(client_1.ImportJobType.images, file, userId);
    }
    history(query) {
        return this.jobs.history(query);
    }
    job(id) {
        return this.jobs.getJob(id);
    }
    rows(id, query) {
        return this.jobs.getRows(id, query);
    }
    async errors(id) {
        const { buffer, filename } = await this.jobs.buildErrorsFile(id);
        return this.xlsx(buffer, filename);
    }
    columns(type) {
        return type === 'categories' ? import_constants_1.CATEGORY_COLUMNS : import_constants_1.PRODUCT_COLUMNS;
    }
    async templateProducts() {
        return this.xlsx(await this.templates.productsTemplate(), 'plantilla-productos.xlsx');
    }
    async templateCategories() {
        return this.xlsx(await this.templates.categoriesTemplate(), 'plantilla-categorias.xlsx');
    }
    async exportProducts(query) {
        const buffer = await this.exporter.exportProducts({
            status: query.status,
            search: query.search,
            categoryId: query.categoryId,
            featured: query.featured,
            hasVariants: query.hasVariants,
        });
        return this.xlsx(buffer, 'productos.xlsx');
    }
    async exportCategories() {
        return this.xlsx(await this.exporter.exportCategories(), 'categorias.xlsx');
    }
    async startJob(type, file, userId) {
        this.assertFile(file);
        const job = await this.jobs.createJob(type, file, userId);
        this.worker.enqueue(job.id);
        return { jobId: job.id };
    }
    assertFile(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('No se recibió ningún archivo.');
        }
    }
    xlsx(buffer, filename) {
        return new common_1.StreamableFile(buffer, {
            type: XLSX_MIME,
            disposition: `attachment; filename="${filename}"`,
        });
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('import/products/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Previsualiza un Excel de productos (sin crear job)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)(fileBodySchema),
    (0, common_1.UseInterceptors)(xlsxUpload),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "previewProducts", null);
__decorate([
    (0, common_1.Post)('import/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Importa productos desde un Excel (proceso asíncrono)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)(fileBodySchema),
    (0, common_1.UseInterceptors)(xlsxUpload),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "importProducts", null);
__decorate([
    (0, common_1.Post)('import/categories/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Previsualiza un Excel de categorías (sin crear job)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)(fileBodySchema),
    (0, common_1.UseInterceptors)(xlsxUpload),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "previewCategories", null);
__decorate([
    (0, common_1.Post)('import/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Importa categorías desde un Excel (proceso asíncrono)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)(fileBodySchema),
    (0, common_1.UseInterceptors)(xlsxUpload),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "importCategories", null);
__decorate([
    (0, common_1.Post)('import/images'),
    (0, swagger_1.ApiOperation)({ summary: 'Carga masiva de imágenes por ZIP (match por SKU/slug)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)(fileBodySchema),
    (0, common_1.UseInterceptors)(zipUpload),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "importImages", null);
__decorate([
    (0, common_1.Get)('import/jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Historial de cargas masivas (paginado)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_jobs_query_dto_1.ImportJobsQueryDto]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "history", null);
__decorate([
    (0, common_1.Get)('import/jobs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Estado de un job (para polling)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "job", null);
__decorate([
    (0, common_1.Get)('import/jobs/:id/rows'),
    (0, swagger_1.ApiOperation)({ summary: 'Incidencias de un job (paginado, filtrable por estado)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, import_jobs_query_dto_1.ImportRowsQueryDto]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "rows", null);
__decorate([
    (0, common_1.Get)('import/jobs/:id/errors.xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Descarga un Excel con solo las filas fallidas' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "errors", null);
__decorate([
    (0, common_1.Get)('import/columns/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Definición de columnas (para el diálogo de instrucciones)' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "columns", null);
__decorate([
    (0, common_1.Get)('import/template/products.xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Plantilla de ejemplo para importar productos' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "templateProducts", null);
__decorate([
    (0, common_1.Get)('import/template/categories.xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Plantilla de ejemplo para importar categorías' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "templateCategories", null);
__decorate([
    (0, common_1.Get)('export/products.xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporta productos a Excel re-importable (acepta filtros)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "exportProducts", null);
__decorate([
    (0, common_1.Get)('export/categories.xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporta categorías a Excel re-importable' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "exportCategories", null);
exports.ImportController = ImportController = __decorate([
    (0, swagger_1.ApiTags)('admin · carga masiva'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [import_jobs_service_1.ImportJobsService,
        import_worker_service_1.ImportWorkerService,
        product_import_service_1.ProductImportService,
        category_import_service_1.CategoryImportService,
        image_import_service_1.ImageImportService,
        template_service_1.TemplateService,
        export_service_1.ExportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map