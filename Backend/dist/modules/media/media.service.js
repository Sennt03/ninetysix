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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const media_storage_service_1 = require("./media-storage.service");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
let MediaService = class MediaService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async list(query) {
        const { page, limit, skip } = query;
        const where = {
            ...(query.search && { originalName: { contains: query.search } }),
            ...(query.usage === 'used' && {
                OR: [{ productLinks: { some: {} } }, { categories: { some: {} } }],
            }),
            ...(query.usage === 'unused' && {
                productLinks: { none: {} },
                categories: { none: {} },
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.mediaAsset.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { productLinks: true, categories: true } } },
            }),
            this.prisma.mediaAsset.count({ where }),
        ]);
        return {
            items: items.map((a) => this.toView(a, a._count.productLinks + a._count.categories)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
        };
    }
    async upload(files) {
        const created = [];
        for (const file of files) {
            const { asset, reused } = await this.persistBuffer(file.buffer, file.originalname ?? null);
            created.push(this.toView(asset, reused ? await this.usageCountOf(asset.id) : 0));
        }
        return created;
    }
    async findOrCreateAssetFromBuffer(buffer, originalName) {
        const { asset } = await this.persistBuffer(buffer, originalName);
        return asset.id;
    }
    async importFromUrl(url) {
        let res;
        try {
            res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
        }
        catch {
            throw new common_1.BadRequestException(`No se pudo descargar la imagen: ${url}`);
        }
        if (!res.ok) {
            throw new common_1.BadRequestException(`No se pudo descargar la imagen (HTTP ${res.status}): ${url}`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.byteLength === 0) {
            throw new common_1.BadRequestException(`La descarga está vacía: ${url}`);
        }
        if (buffer.byteLength > MAX_IMAGE_BYTES) {
            throw new common_1.BadRequestException(`La imagen supera 5 MB: ${url}`);
        }
        const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'image');
        return this.findOrCreateAssetFromBuffer(buffer, name);
    }
    async persistBuffer(buffer, originalName) {
        const hash = (0, node_crypto_1.createHash)('sha256').update(buffer).digest('hex');
        const existing = await this.prisma.mediaAsset.findUnique({ where: { hash } });
        if (existing) {
            return { asset: existing, reused: true };
        }
        const processed = await this.storage.processAndSave({
            buffer,
            originalname: originalName ?? undefined,
        });
        try {
            const asset = await this.prisma.mediaAsset.create({
                data: {
                    filename: processed.filename,
                    originalName: processed.originalName,
                    url: processed.url,
                    thumbnailUrl: processed.thumbnailUrl,
                    mimeType: processed.mimeType,
                    sizeBytes: processed.sizeBytes,
                    width: processed.width,
                    height: processed.height,
                    hash,
                },
            });
            return { asset, reused: false };
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                const again = await this.prisma.mediaAsset.findUnique({ where: { hash } });
                if (again) {
                    await this.storage.deleteFiles({ filename: processed.filename });
                    return { asset: again, reused: true };
                }
            }
            throw e;
        }
    }
    async usageCountOf(assetId) {
        const a = await this.prisma.mediaAsset.findUnique({
            where: { id: assetId },
            include: { _count: { select: { productLinks: true, categories: true } } },
        });
        return a ? a._count.productLinks + a._count.categories : 0;
    }
    async findOne(id) {
        const asset = await this.prisma.mediaAsset.findUnique({
            where: { id },
            include: {
                productLinks: { select: { product: { select: { id: true, name: true } } } },
                categories: { select: { id: true, name: true } },
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        const usage = {
            products: asset.productLinks.map((l) => l.product),
            categories: asset.categories.map((c) => ({ id: c.id, name: c.name })),
        };
        const usageCount = usage.products.length + usage.categories.length;
        return { ...this.toView(asset, usageCount), usage };
    }
    async remove(id) {
        const detail = await this.findOne(id);
        if (detail.usage.products.length || detail.usage.categories.length) {
            throw new common_1.ConflictException({
                message: this.usageMessage(detail.usage),
                usage: detail.usage,
            });
        }
        const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
        if (!asset) {
            return;
        }
        await this.prisma.mediaAsset.delete({ where: { id } });
        await this.storage.deleteFiles(asset);
    }
    async cleanupOrphans(assetIds) {
        const unique = [...new Set(assetIds.filter(Boolean))];
        for (const id of unique) {
            const asset = await this.prisma.mediaAsset.findUnique({
                where: { id },
                include: { _count: { select: { productLinks: true, categories: true } } },
            });
            if (!asset) {
                continue;
            }
            if (asset._count.productLinks + asset._count.categories === 0) {
                await this.prisma.mediaAsset.delete({ where: { id } });
                await this.storage.deleteFiles(asset);
            }
        }
    }
    async assertAssetsExist(assetIds) {
        const unique = [...new Set(assetIds)];
        if (unique.length === 0) {
            return;
        }
        const count = await this.prisma.mediaAsset.count({ where: { id: { in: unique } } });
        if (count !== unique.length) {
            throw new common_1.NotFoundException('Alguna de las imágenes seleccionadas no existe.');
        }
    }
    usageMessage(usage) {
        const parts = [];
        if (usage.products.length) {
            parts.push(`producto(s): ${usage.products.map((p) => p.name).join(', ')}`);
        }
        if (usage.categories.length) {
            parts.push(`categoría(s): ${usage.categories.map((c) => c.name).join(', ')}`);
        }
        return `No se puede eliminar: la imagen está en uso por ${parts.join(' y ')}. Quítala desde ahí primero.`;
    }
    toView(asset, usageCount) {
        return {
            id: asset.id,
            url: asset.url,
            thumbnailUrl: asset.thumbnailUrl,
            originalName: asset.originalName,
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            width: asset.width,
            height: asset.height,
            createdAt: asset.createdAt,
            inUse: usageCount > 0,
            usageCount,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        media_storage_service_1.MediaStorageService])
], MediaService);
//# sourceMappingURL=media.service.js.map