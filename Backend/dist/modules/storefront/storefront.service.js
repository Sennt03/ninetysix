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
exports.StorefrontService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const COLLECTIONS_LIMIT = 6;
const PRODUCTS_HARD_CAP = 300;
const CARD_INCLUDE = {
    categories: { select: { name: true }, take: 1 },
    images: {
        take: 1,
        orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        select: {
            altText: true,
            asset: { select: { url: true, thumbnailUrl: true } },
        },
    },
    variants: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: {
            price: true,
            comparePrice: true,
            stock: true,
            stockPolicy: true,
            isDefault: true,
            color: true,
        },
    },
};
const DETAIL_INCLUDE = {
    categories: { select: { name: true, slug: true } },
    images: {
        orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        select: { altText: true, asset: { select: { url: true, thumbnailUrl: true } } },
    },
    optionTypes: {
        orderBy: { sortOrder: 'asc' },
        include: { values: { orderBy: { sortOrder: 'asc' } } },
    },
    variants: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        include: { options: { include: { optionValue: { include: { optionType: true } } } } },
    },
};
const COLLECTION_SELECT = {
    name: true,
    slug: true,
    description: true,
    imageUrl: true,
    imageAlt: true,
    metaTitle: true,
    metaDescription: true,
    _count: { select: { products: true } },
};
let StorefrontService = class StorefrontService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHome() {
        const [collections, products] = await Promise.all([
            this.prisma.category.findMany({
                where: { status: client_1.CategoryStatus.active, imageUrl: { not: null } },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                take: COLLECTIONS_LIMIT,
                select: COLLECTION_SELECT,
            }),
            this.prisma.product.findMany({
                where: { status: client_1.ProductStatus.active, featured: true },
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                include: CARD_INCLUDE,
            }),
        ]);
        return {
            collections: collections.map((c) => this.toCollection(c)),
            featuredProducts: products.map((p) => this.toCard(p)),
        };
    }
    async getCatalog() {
        const categories = await this.prisma.category.findMany({
            where: { status: client_1.CategoryStatus.active },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            select: COLLECTION_SELECT,
        });
        return { categories: categories.map((c) => this.toCollection(c)) };
    }
    async getProducts(categorySlug) {
        const where = { status: client_1.ProductStatus.active };
        if (categorySlug) {
            const cat = await this.prisma.category.findFirst({
                where: { slug: categorySlug, status: client_1.CategoryStatus.active },
                select: { id: true },
            });
            if (!cat) {
                return [];
            }
            const ids = await this.activeCategoryAndDescendants(cat.id);
            where.categories = { some: { id: { in: ids } } };
        }
        const products = await this.prisma.product.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            include: CARD_INCLUDE,
            take: PRODUCTS_HARD_CAP,
        });
        return products.map((p) => this.toCard(p));
    }
    async getFeatured() {
        const products = await this.prisma.product.findMany({
            where: { status: client_1.ProductStatus.active, featured: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            include: CARD_INCLUDE,
            take: PRODUCTS_HARD_CAP,
        });
        return products.map((p) => this.toCard(p));
    }
    async getCategory(slug) {
        const cat = await this.prisma.category.findFirst({
            where: { slug, status: client_1.CategoryStatus.active },
            select: { ...COLLECTION_SELECT, id: true },
        });
        if (!cat) {
            return null;
        }
        const categoryIds = await this.activeCategoryAndDescendants(cat.id);
        const products = await this.prisma.product.findMany({
            where: {
                status: client_1.ProductStatus.active,
                categories: { some: { id: { in: categoryIds } } },
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            include: CARD_INCLUDE,
            take: PRODUCTS_HARD_CAP,
        });
        return {
            ...this.toCollection(cat),
            productCount: products.length,
            products: products.map((p) => this.toCard(p)),
        };
    }
    async getProduct(slug) {
        const product = await this.prisma.product.findFirst({
            where: { slug, status: client_1.ProductStatus.active },
            include: DETAIL_INCLUDE,
        });
        if (!product) {
            return null;
        }
        return this.toDetail(product);
    }
    async getSitemap() {
        const [products, categories] = await Promise.all([
            this.prisma.product.findMany({
                where: { status: client_1.ProductStatus.active },
                select: { slug: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.category.findMany({
                where: { status: client_1.CategoryStatus.active },
                select: { slug: true, updatedAt: true },
                orderBy: { updatedAt: 'desc' },
            }),
        ]);
        return {
            products: products.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt.toISOString() })),
            categories: categories.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt.toISOString() })),
        };
    }
    async activeCategoryAndDescendants(rootId) {
        const all = await this.prisma.category.findMany({
            where: { status: client_1.CategoryStatus.active },
            select: { id: true, parentId: true },
        });
        const childrenOf = new Map();
        for (const c of all) {
            if (c.parentId) {
                const list = childrenOf.get(c.parentId) ?? [];
                list.push(c.id);
                childrenOf.set(c.parentId, list);
            }
        }
        const ids = [rootId];
        const stack = [rootId];
        while (stack.length) {
            const cur = stack.pop();
            for (const child of childrenOf.get(cur) ?? []) {
                ids.push(child);
                stack.push(child);
            }
        }
        return ids;
    }
    toCollection(c) {
        return {
            name: c.name,
            slug: c.slug,
            description: c.description,
            imageUrl: c.imageUrl,
            imageAlt: c.imageAlt,
            productCount: c._count.products,
            metaTitle: c.metaTitle,
            metaDescription: c.metaDescription,
        };
    }
    toCard(p) {
        const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
        const price = defaultVariant ? Number(defaultVariant.price) : null;
        const compareRaw = defaultVariant?.comparePrice != null ? Number(defaultVariant.comparePrice) : null;
        const comparePrice = compareRaw != null && price != null && compareRaw > price ? compareRaw : null;
        const inStock = p.variants.some((v) => v.stock > 0 || v.stockPolicy === 'allow');
        const colors = [
            ...new Set(p.variants.map((v) => v.color).filter((c) => !!c)),
        ];
        const cover = p.images[0];
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription,
            imageUrl: cover?.asset.url ?? null,
            thumbnailUrl: cover?.asset.thumbnailUrl ?? cover?.asset.url ?? null,
            imageAlt: cover?.altText ?? p.name,
            price,
            comparePrice,
            inStock,
            colors,
            categoryName: p.categories[0]?.name ?? null,
            createdAt: p.createdAt.toISOString(),
        };
    }
    toDetail(p) {
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            shortDescription: p.shortDescription,
            hasVariants: p.hasVariants,
            metaTitle: p.metaTitle,
            metaDescription: p.metaDescription,
            categories: p.categories.map((c) => ({ name: c.name, slug: c.slug })),
            images: p.images.map((img) => ({
                url: img.asset.url,
                thumbnailUrl: img.asset.thumbnailUrl,
                altText: img.altText,
            })),
            optionTypes: p.optionTypes.map((ot) => ({
                name: ot.name,
                values: ot.values.map((v) => v.value),
            })),
            variants: p.variants.map((v) => {
                const price = Number(v.price);
                const compareRaw = v.comparePrice != null ? Number(v.comparePrice) : null;
                return {
                    id: v.id,
                    sku: v.sku,
                    price,
                    comparePrice: compareRaw != null && compareRaw > price ? compareRaw : null,
                    stock: v.stock,
                    stockPolicy: v.stockPolicy,
                    color: v.color,
                    isDefault: v.isDefault,
                    options: v.options.map((o) => ({
                        optionType: o.optionValue.optionType.name,
                        value: o.optionValue.value,
                    })),
                };
            }),
        };
    }
};
exports.StorefrontService = StorefrontService;
exports.StorefrontService = StorefrontService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StorefrontService);
//# sourceMappingURL=storefront.service.js.map