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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_path_1 = require("node:path");
const unzipper_1 = __importDefault(require("unzipper"));
const prisma_service_1 = require("../../database/prisma/prisma.service");
const media_service_1 = require("../media/media.service");
const import_jobs_service_1 = require("./import-jobs.service");
const import_constants_1 = require("./import.constants");
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
let ImageImportService = class ImageImportService {
    constructor(prisma, media, jobs) {
        this.prisma = prisma;
        this.media = media;
        this.jobs = jobs;
    }
    async run(job) {
        const entries = await this.readZip(job.filePath);
        const candidates = new Set();
        for (const e of entries) {
            candidates.add(e.base);
            const stripped = this.stripSuffix(e.base);
            if (stripped) {
                candidates.add(stripped.code);
            }
        }
        const resolve = await this.buildResolver([...candidates]);
        const byProduct = new Map();
        const unresolved = new Map();
        for (const e of entries) {
            const match = this.matchCode(e.base, resolve);
            if (!match) {
                const arr = unresolved.get(e.base) ?? [];
                arr.push(e);
                unresolved.set(e.base, arr);
                continue;
            }
            const productId = resolve(match.code);
            const group = byProduct.get(productId) ?? { code: match.code, items: [] };
            group.items.push({ ...e, ...match });
            byProduct.set(productId, group);
        }
        await this.jobs.markProcessing(job.id, byProduct.size + unresolved.size);
        for (const [productId, group] of byProduct) {
            try {
                const added = await this.attachImages(productId, group.items);
                await this.jobs.recordRow(job.id, {
                    rowNumber: 0,
                    identifier: group.code,
                    status: client_1.ImportRowStatus.ok,
                    action: client_1.ImportRowAction.updated,
                    message: added === 0 ? 'Las imágenes ya estaban asociadas.' : `${added} imagen(es) añadida(s).`,
                });
            }
            catch (e) {
                await this.jobs.recordRow(job.id, {
                    rowNumber: 0,
                    identifier: group.code,
                    status: client_1.ImportRowStatus.error,
                    message: e.message,
                });
            }
        }
        for (const [code, items] of unresolved) {
            await this.jobs.recordRow(job.id, {
                rowNumber: 0,
                identifier: code,
                status: client_1.ImportRowStatus.error,
                message: `Sin producto para "${code}" (no coincide con ningún SKU ni slug). Archivos: ${items
                    .map((i) => i.filename)
                    .join(', ')}`,
            });
        }
        await this.jobs.finalize(job.id);
    }
    async attachImages(productId, items) {
        const existing = await this.prisma.productImage.findMany({
            where: { productId },
            select: { assetId: true, sortOrder: true },
        });
        const existingAssetIds = new Set(existing.map((e) => e.assetId));
        const hadImages = existing.length > 0;
        let nextSort = existing.length ? Math.max(...existing.map((e) => e.sortOrder)) + 1 : 0;
        let added = 0;
        const ordered = [...items].sort((a, b) => a.order - b.order);
        for (const item of ordered) {
            const assetId = await this.media.findOrCreateAssetFromBuffer(item.buffer, item.filename);
            if (existingAssetIds.has(assetId)) {
                continue;
            }
            await this.prisma.productImage.create({
                data: {
                    productId,
                    assetId,
                    sortOrder: nextSort,
                    isCover: !hadImages && nextSort === 0,
                },
            });
            existingAssetIds.add(assetId);
            nextSort += 1;
            added += 1;
        }
        return added;
    }
    async buildResolver(codes) {
        if (!codes.length) {
            return () => undefined;
        }
        const [variants, products] = await Promise.all([
            this.prisma.variant.findMany({
                where: { sku: { in: codes } },
                select: { sku: true, productId: true },
            }),
            this.prisma.product.findMany({
                where: { slug: { in: codes } },
                select: { slug: true, id: true },
            }),
        ]);
        const map = new Map();
        for (const p of products) {
            map.set(p.slug, p.id);
        }
        for (const v of variants) {
            if (v.sku) {
                map.set(v.sku, v.productId);
            }
        }
        return (code) => map.get(code);
    }
    matchCode(base, resolve) {
        if (resolve(base)) {
            return { code: base, order: 1 };
        }
        const stripped = this.stripSuffix(base);
        if (stripped && resolve(stripped.code)) {
            return stripped;
        }
        return null;
    }
    stripSuffix(base) {
        const m = base.match(/^(.*?)[ _-](\d+)$/);
        if (!m) {
            return null;
        }
        return { code: m[1], order: parseInt(m[2], 10) };
    }
    async readZip(zipPath) {
        let directory;
        try {
            directory = await unzipper_1.default.Open.file(zipPath);
        }
        catch {
            throw new common_1.BadRequestException('No se pudo abrir el ZIP.');
        }
        const entries = [];
        for (const file of directory.files) {
            if (file.type !== 'File') {
                continue;
            }
            const name = (0, node_path_1.basename)(file.path);
            if (!name || name.startsWith('.') || file.path.includes('__MACOSX')) {
                continue;
            }
            const ext = (0, node_path_1.extname)(name).toLowerCase();
            if (!IMAGE_EXT.has(ext)) {
                continue;
            }
            if (entries.length >= import_constants_1.LIMITS.maxImages) {
                break;
            }
            const buffer = await file.buffer();
            entries.push({ base: name.slice(0, name.length - ext.length), filename: name, buffer });
        }
        if (entries.length === 0) {
            throw new common_1.BadRequestException('El ZIP no contiene imágenes (jpg, png, webp o gif).');
        }
        return entries;
    }
};
exports.ImageImportService = ImageImportService;
exports.ImageImportService = ImageImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        media_service_1.MediaService,
        import_jobs_service_1.ImportJobsService])
], ImageImportService);
//# sourceMappingURL=image-import.service.js.map