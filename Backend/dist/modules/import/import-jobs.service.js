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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportJobsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const xlsx_util_1 = require("./xlsx.util");
let ImportJobsService = class ImportJobsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.importsDir = (0, node_path_1.join)((0, node_path_1.resolve)(config.get('uploads.dir', { infer: true })), 'imports');
    }
    async createJob(type, file, userId) {
        await (0, promises_1.mkdir)(this.importsDir, { recursive: true });
        const job = await this.prisma.importJob.create({
            data: { type, originalName: file.originalname ?? 'archivo', filePath: '', userId },
        });
        const ext = type === client_1.ImportJobType.images ? 'zip' : 'xlsx';
        const filePath = (0, node_path_1.join)(this.importsDir, `${job.id}.${ext}`);
        await (0, promises_1.writeFile)(filePath, file.buffer);
        return this.prisma.importJob.update({ where: { id: job.id }, data: { filePath } });
    }
    markProcessing(id, totalRows) {
        return this.prisma.importJob.update({
            where: { id },
            data: { status: client_1.ImportJobStatus.processing, startedAt: new Date(), totalRows },
        });
    }
    async recordRow(jobId, result) {
        const ok = result.status === client_1.ImportRowStatus.ok;
        const created = result.action === client_1.ImportRowAction.created;
        const updated = result.action === client_1.ImportRowAction.updated;
        await this.prisma.$transaction([
            this.prisma.importJobRow.create({
                data: {
                    jobId,
                    rowNumber: result.rowNumber,
                    identifier: result.identifier ?? null,
                    status: result.status,
                    action: result.action ?? client_1.ImportRowAction.none,
                    message: result.message?.slice(0, 500) ?? null,
                    rawData: result.rawData ?? client_1.Prisma.JsonNull,
                },
            }),
            this.prisma.importJob.update({
                where: { id: jobId },
                data: {
                    processedRows: { increment: 1 },
                    successCount: { increment: ok ? 1 : 0 },
                    errorCount: { increment: ok ? 0 : 1 },
                    createdCount: { increment: created ? 1 : 0 },
                    updatedCount: { increment: updated ? 1 : 0 },
                },
            }),
        ]);
    }
    async finalize(id) {
        const job = await this.prisma.importJob.findUnique({ where: { id } });
        if (!job) {
            return;
        }
        await this.prisma.importJob.update({
            where: { id },
            data: {
                status: job.errorCount > 0
                    ? client_1.ImportJobStatus.completed_with_errors
                    : client_1.ImportJobStatus.completed,
                finishedAt: new Date(),
            },
        });
    }
    markFailed(id, message) {
        return this.prisma.importJob.update({
            where: { id },
            data: {
                status: client_1.ImportJobStatus.failed,
                message: message.slice(0, 500),
                finishedAt: new Date(),
            },
        });
    }
    async history(query) {
        const { page, limit, skip } = query;
        const where = {
            ...(query.type && { type: query.type }),
            ...(query.search && { originalName: { contains: query.search } }),
        };
        const [items, total] = await Promise.all([
            this.prisma.importJob.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.importJob.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
    }
    async getJob(id) {
        const job = await this.prisma.importJob.findUnique({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException('Proceso de carga no encontrado');
        }
        return job;
    }
    async getRows(id, query) {
        await this.getJob(id);
        const { page, limit, skip } = query;
        const where = {
            jobId: id,
            ...(query.status && { status: query.status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.importJobRow.findMany({
                where,
                skip,
                take: limit,
                orderBy: { rowNumber: 'asc' },
            }),
            this.prisma.importJobRow.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
    }
    async buildErrorsFile(id) {
        const job = await this.getJob(id);
        const rows = await this.prisma.importJobRow.findMany({
            where: { jobId: id, status: client_1.ImportRowStatus.error },
            orderBy: { rowNumber: 'asc' },
        });
        const expanded = [];
        const headerSet = new Set();
        for (const r of rows) {
            const raw = r.rawData;
            const subRows = raw && Array.isArray(raw.__rows)
                ? raw.__rows
                : [raw ?? {}];
            for (const data of subRows) {
                Object.keys(data).forEach((k) => headerSet.add(k));
                expanded.push({ data, error: r.message ?? '' });
            }
        }
        const headers = [...headerSet, 'Error'];
        const body = expanded.map((e) => headers.map((h) => (h === 'Error' ? e.error : (e.data[h] ?? ''))));
        const wb = (0, xlsx_util_1.buildWorkbook)('Errores', headers, body);
        const buffer = await (0, xlsx_util_1.workbookToBuffer)(wb);
        const base = job.originalName.replace(/\.[^.]+$/, '');
        return { buffer, filename: `${base}-errores.xlsx` };
    }
};
exports.ImportJobsService = ImportJobsService;
exports.ImportJobsService = ImportJobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ImportJobsService);
//# sourceMappingURL=import-jobs.service.js.map