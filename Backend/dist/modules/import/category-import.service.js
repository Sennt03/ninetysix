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
exports.CategoryImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slug_util_1 = require("../../common/utils/slug.util");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const media_service_1 = require("../media/media.service");
const categories_service_1 = require("../categories/categories.service");
const import_jobs_service_1 = require("./import-jobs.service");
const import_constants_1 = require("./import.constants");
const parse_util_1 = require("./parse.util");
const xlsx_util_1 = require("./xlsx.util");
let CategoryImportService = class CategoryImportService {
    constructor(prisma, categories, media, jobs) {
        this.prisma = prisma;
        this.categories = categories;
        this.media = media;
        this.jobs = jobs;
    }
    async preview(source) {
        const rows = await (0, xlsx_util_1.readSheetRows)(source, import_constants_1.CATEGORY_COLUMNS);
        const items = rows.map((r) => this.buildItem(r));
        const previewRows = items.slice(0, import_constants_1.LIMITS.previewCap).map((it) => ({
            _row: it.rowNumber,
            _errors: it.errors,
            name: it.name ?? null,
            slug: it.slug ?? (it.name ? (0, slug_util_1.slugify)(it.name) : null),
            parent: it.parentSlug ?? null,
            status: it.status ?? 'active',
            image: it.imageUrl ? 'sí' : 'no',
        }));
        return {
            type: 'categories',
            totalRows: rows.length,
            totalItems: items.length,
            validItems: items.filter((i) => i.errors.length === 0).length,
            invalidItems: items.filter((i) => i.errors.length > 0).length,
            truncated: items.length > import_constants_1.LIMITS.previewCap,
            columns: [
                { key: 'name', header: 'Nombre' },
                { key: 'slug', header: 'Slug' },
                { key: 'parent', header: 'Padre' },
                { key: 'status', header: 'Estado' },
                { key: 'image', header: 'Imagen' },
            ],
            rows: previewRows,
        };
    }
    async run(job) {
        const rows = await (0, xlsx_util_1.readSheetRows)(job.filePath, import_constants_1.CATEGORY_COLUMNS);
        const items = rows.map((r) => this.buildItem(r));
        await this.jobs.markProcessing(job.id, items.length);
        const results = new Map();
        for (const item of items) {
            if (item.errors.length) {
                results.set(item, {
                    action: client_1.ImportRowAction.none,
                    status: client_1.ImportRowStatus.error,
                    message: item.errors.join(' · '),
                });
                continue;
            }
            try {
                const { id, action } = await this.upsert(item);
                results.set(item, { id, action, status: client_1.ImportRowStatus.ok });
            }
            catch (e) {
                results.set(item, {
                    action: client_1.ImportRowAction.none,
                    status: client_1.ImportRowStatus.error,
                    message: e.message,
                });
            }
        }
        const parentSlugs = [...new Set(items.map((i) => i.parentSlug).filter(Boolean))];
        if (parentSlugs.length) {
            const parents = await this.prisma.category.findMany({
                where: { slug: { in: parentSlugs } },
                select: { id: true, slug: true },
            });
            const parentMap = new Map(parents.map((p) => [p.slug, p.id]));
            for (const item of items) {
                const res = results.get(item);
                if (res.status !== client_1.ImportRowStatus.ok || !item.parentSlug || !res.id) {
                    continue;
                }
                const parentId = parentMap.get(item.parentSlug);
                if (!parentId) {
                    res.message = `Categoría padre no encontrada: ${item.parentSlug}`;
                    continue;
                }
                try {
                    await this.categories.update(res.id, { parentId });
                }
                catch (e) {
                    res.message = `No se pudo asignar el padre: ${e.message}`;
                }
            }
        }
        for (const item of items) {
            const res = results.get(item);
            await this.jobs.recordRow(job.id, {
                rowNumber: item.rowNumber,
                identifier: item.slug ?? item.name ?? null,
                status: res.status,
                action: res.action,
                message: res.message ?? null,
                rawData: res.status === client_1.ImportRowStatus.error || res.message ? this.rawForError(item) : undefined,
            });
        }
        await this.jobs.finalize(job.id);
    }
    async upsert(item) {
        const slug = item.slug || (0, slug_util_1.slugify)(item.name);
        const imageAssetId = item.imageUrl ? await this.media.importFromUrl(item.imageUrl) : undefined;
        const dto = {
            name: item.name,
            slug,
            description: item.description,
            ...(imageAssetId && { imageAssetId, imageAlt: item.imageAlt || item.name }),
            status: item.status,
            sortOrder: item.sortOrder,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
        };
        const existing = await this.prisma.category.findUnique({
            where: { slug },
            select: { id: true },
        });
        if (existing) {
            await this.categories.update(existing.id, dto);
            return { id: existing.id, action: client_1.ImportRowAction.updated };
        }
        const created = await this.categories.create(dto);
        return { id: created.id, action: client_1.ImportRowAction.created };
    }
    buildItem(row) {
        const errors = [];
        const v = row.values;
        const name = v.name?.trim();
        if (!name) {
            errors.push('Falta el Nombre (columna obligatoria).');
        }
        let status;
        try {
            status = (0, parse_util_1.parseCategoryStatus)(v.status);
        }
        catch (e) {
            errors.push(e.message);
        }
        let sortOrder;
        try {
            sortOrder = (0, parse_util_1.parseIntField)(v.sortOrder, 'Orden');
        }
        catch (e) {
            errors.push(e.message);
        }
        const imageUrl = v.imageUrl?.trim() || undefined;
        if (imageUrl && !v.imageAlt?.trim()) {
            errors.push('La imagen requiere texto Alt (columna Imagen Alt).');
        }
        return {
            rowNumber: row.rowNumber,
            name,
            slug: v.slug?.trim() || undefined,
            description: v.description?.trim() || undefined,
            parentSlug: v.parent?.trim() ? (0, slug_util_1.slugify)(v.parent) : undefined,
            imageUrl,
            imageAlt: v.imageAlt?.trim() || undefined,
            status,
            sortOrder,
            metaTitle: v.metaTitle?.trim() || undefined,
            metaDescription: v.metaDescription?.trim() || undefined,
            errors,
            raw: row,
        };
    }
    rawForError(item) {
        const headerByKey = new Map(import_constants_1.CATEGORY_COLUMNS.map((c) => [c.key, c.header]));
        const out = {};
        for (const [key, value] of Object.entries(item.raw.values)) {
            out[headerByKey.get(key) ?? key] = value;
        }
        return out;
    }
};
exports.CategoryImportService = CategoryImportService;
exports.CategoryImportService = CategoryImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        categories_service_1.CategoriesService,
        media_service_1.MediaService,
        import_jobs_service_1.ImportJobsService])
], CategoryImportService);
//# sourceMappingURL=category-import.service.js.map