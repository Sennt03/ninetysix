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
var ProductImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slug_util_1 = require("../../common/utils/slug.util");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const media_service_1 = require("../media/media.service");
const products_service_1 = require("../products/products.service");
const import_jobs_service_1 = require("./import-jobs.service");
const import_constants_1 = require("./import.constants");
const parse_util_1 = require("./parse.util");
const xlsx_util_1 = require("./xlsx.util");
let ProductImportService = ProductImportService_1 = class ProductImportService {
    constructor(prisma, products, media, jobs) {
        this.prisma = prisma;
        this.products = products;
        this.media = media;
        this.jobs = jobs;
        this.logger = new common_1.Logger(ProductImportService_1.name);
    }
    async preview(source) {
        const rows = await (0, xlsx_util_1.readSheetRows)(source, import_constants_1.PRODUCT_COLUMNS);
        const items = this.buildItems(rows);
        const previewRows = items.slice(0, import_constants_1.LIMITS.previewCap).map((it) => ({
            _row: it.firstRow,
            _errors: it.errors,
            handle: it.handle || null,
            name: it.name ?? null,
            status: it.status ?? 'draft',
            variants: it.variants.length,
            images: it.images.length,
            categories: it.categorySlugs.join(', ') || null,
            price: it.variants.find((v) => v.price != null)?.price ?? null,
        }));
        return {
            type: 'products',
            totalRows: rows.length,
            totalItems: items.length,
            validItems: items.filter((i) => i.errors.length === 0).length,
            invalidItems: items.filter((i) => i.errors.length > 0).length,
            truncated: items.length > import_constants_1.LIMITS.previewCap,
            columns: [
                { key: 'handle', header: 'Handle' },
                { key: 'name', header: 'Nombre' },
                { key: 'status', header: 'Estado' },
                { key: 'variants', header: 'Variantes' },
                { key: 'images', header: 'Imágenes' },
                { key: 'categories', header: 'Categorías' },
                { key: 'price', header: 'Precio' },
            ],
            rows: previewRows,
        };
    }
    async run(job) {
        const rows = await (0, xlsx_util_1.readSheetRows)(job.filePath, import_constants_1.PRODUCT_COLUMNS);
        const items = this.buildItems(rows);
        await this.jobs.markProcessing(job.id, items.length);
        for (const item of items) {
            if (item.errors.length) {
                await this.jobs.recordRow(job.id, {
                    rowNumber: item.firstRow,
                    identifier: item.handle || null,
                    status: client_1.ImportRowStatus.error,
                    message: item.errors.join(' · '),
                    rawData: this.rawForError(item),
                });
                continue;
            }
            try {
                const { action, warning } = await this.executeItem(item);
                await this.jobs.recordRow(job.id, {
                    rowNumber: item.firstRow,
                    identifier: item.handle,
                    status: client_1.ImportRowStatus.ok,
                    action,
                    message: warning ?? null,
                    rawData: warning ? this.rawForError(item) : undefined,
                });
            }
            catch (e) {
                await this.jobs.recordRow(job.id, {
                    rowNumber: item.firstRow,
                    identifier: item.handle,
                    status: client_1.ImportRowStatus.error,
                    message: e.message,
                    rawData: this.rawForError(item),
                });
            }
        }
        await this.jobs.finalize(job.id);
    }
    async executeItem(item) {
        const slug = item.slug || (0, slug_util_1.slugify)(item.handle);
        const categoryIds = await this.resolveCategories(item.categorySlugs);
        const failedImages = [];
        const newImages = [];
        for (const img of item.images) {
            try {
                const assetId = await this.media.importFromUrl(img.url);
                newImages.push({ assetId, altText: img.alt });
            }
            catch (e) {
                failedImages.push(`${img.url} (${e.message})`);
            }
        }
        const existing = await this.prisma.product.findUnique({
            where: { slug },
            select: { id: true },
        });
        const dto = {
            name: item.name,
            slug,
            description: item.description,
            shortDescription: item.shortDescription,
            status: item.status,
            featured: item.featured,
            hasVariants: item.hasVariants,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            categoryIds,
            optionTypes: item.hasVariants ? item.optionTypes : undefined,
            variants: item.variants.map((v) => this.toVariantDto(v)),
            images: await this.buildImages(existing?.id, newImages),
        };
        if (existing) {
            await this.products.update(existing.id, dto);
            return { action: client_1.ImportRowAction.updated, warning: this.imagesWarning(failedImages) };
        }
        await this.products.create(dto);
        return { action: client_1.ImportRowAction.created, warning: this.imagesWarning(failedImages) };
    }
    imagesWarning(failed) {
        return failed.length ? `Imágenes no importadas: ${failed.join('; ')}` : undefined;
    }
    toVariantDto(v) {
        return {
            sku: v.sku,
            price: v.price ?? 0,
            comparePrice: v.comparePrice,
            costPrice: v.costPrice,
            stock: v.stock,
            stockPolicy: v.stockPolicy,
            weight: v.weight,
            color: v.color,
            isDefault: v.isDefault,
            active: v.active,
            options: v.options,
        };
    }
    async buildImages(productId, newImages) {
        const result = [];
        const seen = new Set();
        if (productId) {
            const current = await this.prisma.productImage.findMany({
                where: { productId },
                orderBy: { sortOrder: 'asc' },
                select: { assetId: true, altText: true },
            });
            for (const c of current) {
                if (!seen.has(c.assetId)) {
                    seen.add(c.assetId);
                    result.push({ assetId: c.assetId, altText: c.altText ?? undefined });
                }
            }
        }
        for (const img of newImages) {
            if (!seen.has(img.assetId)) {
                seen.add(img.assetId);
                result.push(img);
            }
        }
        return result.length ? result.slice(0, 20) : undefined;
    }
    async resolveCategories(slugs) {
        if (!slugs.length) {
            return undefined;
        }
        const found = await this.prisma.category.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true },
        });
        const bySlug = new Map(found.map((c) => [c.slug, c.id]));
        const missing = slugs.filter((s) => !bySlug.has(s));
        if (missing.length) {
            throw new Error(`Categorías no encontradas: ${missing.join(', ')}`);
        }
        return slugs.map((s) => bySlug.get(s));
    }
    buildItems(rows) {
        const groups = new Map();
        const order = [];
        for (const row of rows) {
            const handle = (row.values.handle ?? '').trim();
            const key = handle || `__row_${row.rowNumber}`;
            if (!groups.has(key)) {
                groups.set(key, []);
                order.push(key);
            }
            groups.get(key).push(row);
        }
        return order.map((key) => this.buildItem(groups.get(key)));
    }
    buildItem(rows) {
        const errors = [];
        const tryParse = (fn) => {
            try {
                return fn();
            }
            catch (e) {
                errors.push(e.message);
                return undefined;
            }
        };
        const first = rows[0];
        const handle = (first.values.handle ?? '').trim();
        if (!handle) {
            errors.push('Falta el Handle (columna obligatoria que agrupa el producto).');
        }
        const name = first.values.name?.trim();
        if (!name) {
            errors.push('Falta el Nombre (obligatorio en la primera fila del producto).');
        }
        const images = [];
        const seenUrls = new Set();
        for (const row of rows) {
            for (const url of (0, parse_util_1.splitList)(row.values.imageUrl)) {
                if (!seenUrls.has(url)) {
                    seenUrls.add(url);
                    images.push({ url, alt: row.values.imageAlt });
                }
            }
        }
        const variants = [];
        for (const row of rows) {
            const v = row.values;
            const options = [];
            for (const i of [1, 2, 3]) {
                const optName = v[`option${i}Name`]?.trim();
                const optVal = v[`option${i}Value`]?.trim();
                if (optVal) {
                    if (!optName) {
                        errors.push(`Fila ${row.rowNumber}: Opción${i} tiene valor pero falta el nombre.`);
                    }
                    else {
                        options.push({ optionType: optName, value: optVal });
                    }
                }
            }
            const hasPrice = !!v.price?.trim();
            if (!hasPrice && options.length === 0) {
                continue;
            }
            const price = tryParse(() => (0, parse_util_1.parseDecimal)(v.price, 'Precio'));
            if (price == null) {
                errors.push(`Fila ${row.rowNumber}: falta el Precio de la variante.`);
            }
            variants.push({
                rowNumber: row.rowNumber,
                sku: v.sku?.trim() || undefined,
                price,
                comparePrice: tryParse(() => (0, parse_util_1.parseDecimal)(v.comparePrice, 'Precio comparado')),
                costPrice: tryParse(() => (0, parse_util_1.parseDecimal)(v.costPrice, 'Costo')),
                stock: tryParse(() => (0, parse_util_1.parseIntField)(v.stock, 'Stock')),
                stockPolicy: tryParse(() => (0, parse_util_1.parseStockPolicy)(v.stockPolicy)),
                weight: tryParse(() => (0, parse_util_1.parseDecimal)(v.weight, 'Peso')),
                color: tryParse(() => (0, parse_util_1.parseColor)(v.color)),
                isDefault: tryParse(() => (0, parse_util_1.parseBool)(v.isDefault)),
                active: tryParse(() => (0, parse_util_1.parseBool)(v.active)),
                options,
            });
        }
        if (variants.length === 0) {
            errors.push('El producto no tiene ninguna variante con Precio.');
        }
        const hasVariants = variants.some((v) => v.options.length > 0);
        if (!hasVariants && variants.length > 1) {
            errors.push('Hay varias filas pero sin columnas de Opción para diferenciarlas.');
        }
        const typeOrder = [];
        const valuesByType = new Map();
        for (const variant of variants) {
            for (const o of variant.options) {
                if (!valuesByType.has(o.optionType)) {
                    valuesByType.set(o.optionType, []);
                    typeOrder.push(o.optionType);
                }
                const arr = valuesByType.get(o.optionType);
                if (!arr.includes(o.value)) {
                    arr.push(o.value);
                }
            }
        }
        if (typeOrder.length > 3) {
            errors.push('Máximo 3 tipos de opción por producto.');
        }
        const optionTypes = typeOrder.map((n) => ({ name: n, values: valuesByType.get(n) }));
        return {
            handle,
            firstRow: first.rowNumber,
            rowNumbers: rows.map((r) => r.rowNumber),
            name,
            slug: first.values.slug?.trim() || undefined,
            description: first.values.description?.trim() || undefined,
            shortDescription: first.values.shortDescription?.trim() || undefined,
            status: tryParse(() => (0, parse_util_1.parseProductStatus)(first.values.status)),
            featured: tryParse(() => (0, parse_util_1.parseBool)(first.values.featured)),
            metaTitle: first.values.metaTitle?.trim() || undefined,
            metaDescription: first.values.metaDescription?.trim() || undefined,
            categorySlugs: (0, parse_util_1.splitList)(first.values.categories),
            images,
            hasVariants,
            optionTypes,
            variants,
            errors,
            raw: rows,
        };
    }
    rawForError(item) {
        const headerByKey = new Map(import_constants_1.PRODUCT_COLUMNS.map((c) => [c.key, c.header]));
        const subRows = item.raw.map((r) => {
            const out = {};
            for (const [key, value] of Object.entries(r.values)) {
                out[headerByKey.get(key) ?? key] = value;
            }
            return out;
        });
        return { __rows: subRows };
    }
};
exports.ProductImportService = ProductImportService;
exports.ProductImportService = ProductImportService = ProductImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        media_service_1.MediaService,
        import_jobs_service_1.ImportJobsService])
], ProductImportService);
//# sourceMappingURL=product-import.service.js.map