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
var ImportWorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportWorkerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const category_import_service_1 = require("./category-import.service");
const image_import_service_1 = require("./image-import.service");
const import_jobs_service_1 = require("./import-jobs.service");
const product_import_service_1 = require("./product-import.service");
let ImportWorkerService = ImportWorkerService_1 = class ImportWorkerService {
    constructor(prisma, jobs, productImport, categoryImport, imageImport) {
        this.prisma = prisma;
        this.jobs = jobs;
        this.productImport = productImport;
        this.categoryImport = categoryImport;
        this.imageImport = imageImport;
        this.logger = new common_1.Logger(ImportWorkerService_1.name);
        this.queue = [];
        this.processing = false;
    }
    async onApplicationBootstrap() {
        const pending = await this.prisma.importJob.findMany({
            where: { status: { in: [client_1.ImportJobStatus.pending, client_1.ImportJobStatus.processing] } },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        if (!pending.length) {
            return;
        }
        await this.prisma.importJob.updateMany({
            where: { status: client_1.ImportJobStatus.processing },
            data: { status: client_1.ImportJobStatus.pending, processedRows: 0, successCount: 0, errorCount: 0, createdCount: 0, updatedCount: 0 },
        });
        await this.prisma.importJobRow.deleteMany({ where: { jobId: { in: pending.map((p) => p.id) } } });
        this.logger.log(`Reencolando ${pending.length} job(s) de importación pendientes`);
        for (const p of pending) {
            this.enqueue(p.id);
        }
    }
    enqueue(jobId) {
        this.queue.push(jobId);
        void this.tick();
    }
    async tick() {
        if (this.processing) {
            return;
        }
        const id = this.queue.shift();
        if (!id) {
            return;
        }
        this.processing = true;
        try {
            await this.process(id);
        }
        catch (e) {
            this.logger.error(`Fallo procesando job ${id}: ${e.message}`);
        }
        finally {
            this.processing = false;
            void this.tick();
        }
    }
    async process(id) {
        const job = await this.prisma.importJob.findUnique({ where: { id } });
        if (!job) {
            return;
        }
        this.logger.log(`Procesando job ${id} (${job.type})`);
        try {
            switch (job.type) {
                case client_1.ImportJobType.products:
                    await this.productImport.run(job);
                    break;
                case client_1.ImportJobType.categories:
                    await this.categoryImport.run(job);
                    break;
                case client_1.ImportJobType.images:
                    await this.imageImport.run(job);
                    break;
            }
        }
        catch (e) {
            await this.jobs.markFailed(id, e.message);
            this.logger.error(`Job ${id} marcado como failed: ${e.message}`);
        }
    }
};
exports.ImportWorkerService = ImportWorkerService;
exports.ImportWorkerService = ImportWorkerService = ImportWorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        import_jobs_service_1.ImportJobsService,
        product_import_service_1.ProductImportService,
        category_import_service_1.CategoryImportService,
        image_import_service_1.ImageImportService])
], ImportWorkerService);
//# sourceMappingURL=import-worker.service.js.map