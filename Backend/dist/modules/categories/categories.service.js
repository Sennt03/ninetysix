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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slug_util_1 = require("../../common/utils/slug.util");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const media_service_1 = require("../media/media.service");
const MAX_DEPTH = 3;
let CategoriesService = class CategoriesService {
    constructor(prisma, media) {
        this.prisma = prisma;
        this.media = media;
    }
    async findTree() {
        const cats = await this.prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { products: true } } },
        });
        const nodes = new Map();
        cats.forEach((c) => nodes.set(c.id, this.toNode(c)));
        const roots = [];
        cats.forEach((c) => {
            const node = nodes.get(c.id);
            const parent = c.parentId ? nodes.get(c.parentId) : undefined;
            if (parent) {
                parent.children.push(node);
            }
            else {
                roots.push(node);
            }
        });
        return roots;
    }
    async findFlat(params) {
        const where = {
            ...(params.status && { status: params.status }),
            ...(params.parentId && { parentId: params.parentId }),
            ...(params.search && { name: { contains: params.search } }),
        };
        const cats = await this.prisma.category.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
        });
        return cats.map((c) => ({ ...this.toNode(c), parentName: c.parent?.name ?? null }));
    }
    async findOne(id) {
        const c = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
        });
        if (!c) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return { ...this.toNode(c), parentName: c.parent?.name ?? null };
    }
    async create(dto) {
        const slug = dto.slug
            ? await this.assertSlugFree(dto.slug)
            : await (0, slug_util_1.uniqueSlug)(dto.name, (s) => this.slugExists(s));
        if (dto.parentId) {
            const { parentOf } = await this.loadGraph();
            if (!parentOf.has(dto.parentId)) {
                throw new common_1.NotFoundException('La categoría padre no existe');
            }
            if (this.depthOf(dto.parentId, parentOf) >= MAX_DEPTH) {
                throw new common_1.BadRequestException(`Máximo ${MAX_DEPTH} niveles de profundidad`);
            }
        }
        const imageUrl = await this.resolveImageUrl(dto.imageAssetId ?? null);
        const created = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description ?? null,
                parentId: dto.parentId ?? null,
                imageAssetId: dto.imageAssetId ?? null,
                imageUrl,
                imageAlt: dto.imageAlt ?? null,
                sortOrder: dto.sortOrder ?? 0,
                status: dto.status ?? client_1.CategoryStatus.active,
                metaTitle: dto.metaTitle ?? null,
                metaDescription: dto.metaDescription ?? null,
            },
            include: { _count: { select: { products: true } } },
        });
        return this.toNode(created);
    }
    async update(id, dto) {
        const existing = await this.prisma.category.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        if (dto.slug && dto.slug !== existing.slug) {
            await this.assertSlugFree(dto.slug, id);
        }
        if (dto.parentId !== undefined) {
            await this.validateParentChange(id, dto.parentId ?? null);
        }
        const changeImage = dto.imageAssetId !== undefined;
        const previousAssetId = existing.imageAssetId;
        const newImageUrl = changeImage ? await this.resolveImageUrl(dto.imageAssetId ?? null) : null;
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.slug !== undefined && { slug: dto.slug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.parentId !== undefined && { parentId: dto.parentId }),
                ...(changeImage && { imageAssetId: dto.imageAssetId ?? null, imageUrl: newImageUrl }),
                ...(dto.imageAlt !== undefined && { imageAlt: dto.imageAlt }),
                ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
                ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
            },
            include: { _count: { select: { products: true } } },
        });
        if (changeImage && previousAssetId && previousAssetId !== dto.imageAssetId) {
            await this.media.cleanupOrphans([previousAssetId]);
        }
        return this.toNode(updated);
    }
    async remove(id, opts) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { children: true, products: true } } },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        if (opts.reassignChildrenTo) {
            await this.ensureExists(opts.reassignChildrenTo);
        }
        if (opts.reassignProductsTo) {
            await this.ensureExists(opts.reassignProductsTo);
        }
        if (category._count.products > 0 && !opts.reassignProductsTo) {
            const onlyHere = await this.prisma.product.count({
                where: {
                    AND: [{ categories: { some: { id } } }, { categories: { every: { id } } }],
                },
            });
            if (onlyHere > 0) {
                throw new common_1.ConflictException('Hay productos cuya única categoría es esta. Indica una categoría destino.');
            }
        }
        await this.prisma.$transaction(async (tx) => {
            if (opts.reassignProductsTo) {
                const products = await tx.product.findMany({
                    where: { categories: { some: { id } } },
                    select: { id: true },
                });
                for (const p of products) {
                    await tx.product.update({
                        where: { id: p.id },
                        data: { categories: { connect: { id: opts.reassignProductsTo } } },
                    });
                }
            }
            if (category._count.children > 0) {
                await tx.category.updateMany({
                    where: { parentId: id },
                    data: { parentId: opts.reassignChildrenTo ?? null },
                });
            }
            await tx.category.delete({ where: { id } });
        });
        if (category.imageAssetId) {
            await this.media.cleanupOrphans([category.imageAssetId]);
        }
    }
    async reorder(items) {
        await this.prisma.$transaction(items.map((it) => this.prisma.category.update({ where: { id: it.id }, data: { sortOrder: it.sortOrder } })));
    }
    async resolveImageUrl(assetId) {
        if (!assetId) {
            return null;
        }
        const asset = await this.prisma.mediaAsset.findUnique({
            where: { id: assetId },
            select: { url: true },
        });
        if (!asset) {
            throw new common_1.NotFoundException('La imagen seleccionada no existe.');
        }
        return asset.url;
    }
    toNode(c) {
        return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            parentId: c.parentId,
            imageAssetId: c.imageAssetId,
            imageUrl: c.imageUrl,
            imageAlt: c.imageAlt,
            sortOrder: c.sortOrder,
            status: c.status,
            metaTitle: c.metaTitle,
            metaDescription: c.metaDescription,
            productCount: c._count.products,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            children: [],
        };
    }
    async ensureExists(id) {
        const found = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
        if (!found) {
            throw new common_1.NotFoundException(`La categoría destino ${id} no existe`);
        }
    }
    slugExists(slug, exceptId) {
        return this.prisma.category
            .findFirst({
            where: { slug, ...(exceptId && { id: { not: exceptId } }) },
            select: { id: true },
        })
            .then((c) => c !== null);
    }
    async assertSlugFree(slug, exceptId) {
        if (await this.slugExists(slug, exceptId)) {
            const suggestion = await (0, slug_util_1.uniqueSlug)(slug, (s) => this.slugExists(s, exceptId));
            throw new common_1.ConflictException(`Slug en uso. Sugerencia: ${suggestion}`);
        }
        return slug;
    }
    async loadGraph() {
        const all = await this.prisma.category.findMany({ select: { id: true, parentId: true } });
        const parentOf = new Map();
        const childrenOf = new Map();
        for (const c of all) {
            parentOf.set(c.id, c.parentId);
            if (c.parentId) {
                const siblings = childrenOf.get(c.parentId) ?? [];
                siblings.push(c.id);
                childrenOf.set(c.parentId, siblings);
            }
        }
        return { parentOf, childrenOf };
    }
    depthOf(id, parentOf) {
        let depth = 1;
        let current = parentOf.get(id) ?? null;
        let guard = 0;
        while (current && guard < MAX_DEPTH + 2) {
            depth += 1;
            current = parentOf.get(current) ?? null;
            guard += 1;
        }
        return depth;
    }
    collectDescendants(id, childrenOf) {
        const out = new Set();
        const stack = [...(childrenOf.get(id) ?? [])];
        while (stack.length) {
            const node = stack.pop();
            if (!out.has(node)) {
                out.add(node);
                stack.push(...(childrenOf.get(node) ?? []));
            }
        }
        return out;
    }
    subtreeHeight(id, childrenOf) {
        const kids = childrenOf.get(id) ?? [];
        if (kids.length === 0) {
            return 1;
        }
        return 1 + Math.max(...kids.map((k) => this.subtreeHeight(k, childrenOf)));
    }
    async validateParentChange(id, parentId) {
        if (parentId === null) {
            return;
        }
        if (parentId === id) {
            throw new common_1.BadRequestException('Una categoría no puede ser su propio padre');
        }
        const { parentOf, childrenOf } = await this.loadGraph();
        if (!parentOf.has(parentId)) {
            throw new common_1.NotFoundException('La categoría padre no existe');
        }
        if (this.collectDescendants(id, childrenOf).has(parentId)) {
            throw new common_1.BadRequestException('No es posible asignar esta categoría como padre (crearía un ciclo)');
        }
        if (this.depthOf(parentId, parentOf) + this.subtreeHeight(id, childrenOf) > MAX_DEPTH) {
            throw new common_1.BadRequestException(`El movimiento excede los ${MAX_DEPTH} niveles de profundidad`);
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        media_service_1.MediaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map