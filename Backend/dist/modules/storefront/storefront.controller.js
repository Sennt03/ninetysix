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
exports.StorefrontController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const storefront_service_1 = require("./storefront.service");
let StorefrontController = class StorefrontController {
    constructor(storefront) {
        this.storefront = storefront;
    }
    home() {
        return this.storefront.getHome();
    }
    catalog() {
        return this.storefront.getCatalog();
    }
    products(category) {
        return this.storefront.getProducts(category);
    }
    featured() {
        return this.storefront.getFeatured();
    }
    sitemap() {
        return this.storefront.getSitemap();
    }
    async category(slug) {
        const category = await this.storefront.getCategory(slug);
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return category;
    }
    async product(slug) {
        const product = await this.storefront.getProduct(slug);
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return product;
    }
};
exports.StorefrontController = StorefrontController;
__decorate([
    (0, common_1.Get)('home'),
    (0, swagger_1.ApiOperation)({ summary: 'Datos de la portada: colecciones + productos destacados' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "home", null);
__decorate([
    (0, common_1.Get)('catalog'),
    (0, swagger_1.ApiOperation)({ summary: 'Catálogo: todas las categorías activas' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Productos activos (opcional ?category=slug para filtrar)' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "products", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Productos destacados activos' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "featured", null);
__decorate([
    (0, common_1.Get)('sitemap'),
    (0, swagger_1.ApiOperation)({ summary: 'Slugs activos (producto + categoría) para el sitemap.xml' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "sitemap", null);
__decorate([
    (0, common_1.Get)('categories/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalle de categoría + sus productos activos' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorefrontController.prototype, "category", null);
__decorate([
    (0, common_1.Get)('products/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalle público de un producto (variantes incluidas)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorefrontController.prototype, "product", null);
exports.StorefrontController = StorefrontController = __decorate([
    (0, swagger_1.ApiTags)('tienda · público'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('storefront'),
    __metadata("design:paramtypes", [storefront_service_1.StorefrontService])
], StorefrontController);
//# sourceMappingURL=storefront.controller.js.map