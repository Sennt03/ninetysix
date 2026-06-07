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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const import_constants_1 = require("./import.constants");
const xlsx_util_1 = require("./xlsx.util");
const EXPORT_CAP = 10_000;
const PRODUCT_INCLUDE = {
    categories: { select: { slug: true } },
    images: { orderBy: { sortOrder: 'asc' }, include: { asset: { select: { url: true } } } },
    optionTypes: { orderBy: { sortOrder: 'asc' } },
    variants: {
        orderBy: { sortOrder: 'asc' },
        include: { options: { include: { optionValue: { include: { optionType: true } } } } },
    },
};
let ExportService = class ExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportProducts(filter) {
        const where = {
            ...(filter.status?.length && { status: { in: filter.status } }),
            ...(filter.featured !== undefined && { featured: filter.featured }),
            ...(filter.hasVariants !== undefined && { hasVariants: filter.hasVariants }),
            ...(filter.categoryId && { categories: { some: { id: filter.categoryId } } }),
            ...(filter.search && {
                OR: [
                    { name: { contains: filter.search } },
                    { variants: { some: { sku: { contains: filter.search } } } },
                ],
            }),
        };
        const products = await this.prisma.product.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            take: EXPORT_CAP,
            include: PRODUCT_INCLUDE,
        });
        const rows = [];
        for (const product of products) {
            rows.push(...this.productRows(product));
        }
        const wb = (0, xlsx_util_1.buildWorkbook)('Productos', this.headers(import_constants_1.PRODUCT_COLUMNS), rows);
        return (0, xlsx_util_1.workbookToBuffer)(wb);
    }
    async exportCategories() {
        const cats = await this.prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: { parent: { select: { slug: true } } },
        });
        const rows = cats.map((c) => this.toRow(import_constants_1.CATEGORY_COLUMNS, {
            name: c.name,
            slug: c.slug,
            description: c.description ?? '',
            parent: c.parent?.slug ?? '',
            imageUrl: c.imageUrl ?? '',
            imageAlt: c.imageAlt ?? '',
            status: c.status,
            sortOrder: String(c.sortOrder),
            metaTitle: c.metaTitle ?? '',
            metaDescription: c.metaDescription ?? '',
        }));
        const wb = (0, xlsx_util_1.buildWorkbook)('Categorías', this.headers(import_constants_1.CATEGORY_COLUMNS), rows);
        return (0, xlsx_util_1.workbookToBuffer)(wb);
    }
    productRows(product) {
        const imageUrls = product.images.map((img) => img.asset.url);
        const firstAlt = product.images[0]?.altText ?? '';
        return product.variants.map((variant, index) => {
            const rec = { handle: product.slug };
            if (index === 0) {
                rec.name = product.name;
                rec.slug = product.slug;
                rec.description = product.description ?? '';
                rec.shortDescription = product.shortDescription ?? '';
                rec.status = product.status;
                rec.featured = product.featured ? 'sí' : 'no';
                rec.categories = product.categories.map((c) => c.slug).join('|');
                rec.metaTitle = product.metaTitle ?? '';
                rec.metaDescription = product.metaDescription ?? '';
                rec.imageUrl = imageUrls.join('|');
                rec.imageAlt = firstAlt;
            }
            product.optionTypes.forEach((ot, oi) => {
                const match = variant.options.find((o) => o.optionValue.optionType.id === ot.id);
                rec[`option${oi + 1}Name`] = ot.name;
                rec[`option${oi + 1}Value`] = match?.optionValue.value ?? '';
            });
            rec.sku = variant.sku ?? '';
            rec.price = String(variant.price);
            rec.comparePrice = variant.comparePrice != null ? String(variant.comparePrice) : '';
            rec.costPrice = variant.costPrice != null ? String(variant.costPrice) : '';
            rec.stock = String(variant.stock);
            rec.stockPolicy = variant.stockPolicy;
            rec.weight = variant.weight != null ? String(variant.weight) : '';
            rec.color = variant.color ?? '';
            rec.isDefault = variant.isDefault ? 'sí' : 'no';
            rec.active = variant.active ? 'sí' : 'no';
            return this.toRow(import_constants_1.PRODUCT_COLUMNS, rec);
        });
    }
    headers(columns) {
        return columns.map((c) => c.header);
    }
    toRow(columns, rec) {
        return columns.map((c) => rec[c.key] ?? '');
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map