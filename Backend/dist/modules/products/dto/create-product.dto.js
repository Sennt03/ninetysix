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
exports.CreateProductDto = exports.ProductImageInputDto = exports.VariantInputDto = exports.OptionTypeInputDto = exports.VariantOptionRefDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class VariantOptionRefDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { optionType: { required: true, type: () => String }, value: { required: true, type: () => String } };
    }
}
exports.VariantOptionRefDto = VariantOptionRefDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Color' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VariantOptionRefDto.prototype, "optionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Rojo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VariantOptionRefDto.prototype, "value", void 0);
class OptionTypeInputDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, maxLength: 100 }, values: { required: true, type: () => [String], maxLength: 100 }, sortOrder: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.OptionTypeInputDto = OptionTypeInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Color' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], OptionTypeInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['Rojo', 'Azul'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ArrayMaxSize)(30),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(100, { each: true }),
    __metadata("design:type", Array)
], OptionTypeInputDto.prototype, "values", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OptionTypeInputDto.prototype, "sortOrder", void 0);
class VariantInputDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sku: { required: false, type: () => String, maxLength: 100 }, price: { required: true, type: () => Number, minimum: 0 }, comparePrice: { required: false, type: () => Number, minimum: 0 }, costPrice: { required: false, type: () => Number, minimum: 0 }, stock: { required: false, type: () => Number, minimum: 0 }, stockPolicy: { required: false, type: () => Object }, weight: { required: false, type: () => Number, minimum: 0 }, color: { required: false, type: () => String, pattern: "/^#[0-9A-Fa-f]{6}$/" }, isDefault: { required: false, type: () => Boolean }, active: { required: false, type: () => Boolean }, sortOrder: { required: false, type: () => Number, minimum: 0 }, options: { required: false, type: () => [require("./create-product.dto").VariantOptionRefDto] } };
    }
}
exports.VariantInputDto = VariantInputDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Único si se indica.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], VariantInputDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19.99 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Debe ser > price.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "comparePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Solo admin; nunca en API pública.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "stock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.StockPolicy, default: client_1.StockPolicy.deny }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StockPolicy),
    __metadata("design:type", String)
], VariantInputDto.prototype, "stockPolicy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gramos.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color hex de la variante, p.ej. #FF5733.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un hex válido como #FF5733.' }),
    __metadata("design:type", String)
], VariantInputDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VariantInputDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VariantInputDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VariantInputDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [VariantOptionRefDto],
        description: 'Combinación (modo variantes).',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VariantOptionRefDto),
    __metadata("design:type", Array)
], VariantInputDto.prototype, "options", void 0);
class ProductImageInputDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { assetId: { required: true, type: () => String }, altText: { required: false, type: () => String, maxLength: 255 }, sortOrder: { required: false, type: () => Number, minimum: 0 }, isCover: { required: false, type: () => Boolean } };
    }
}
exports.ProductImageInputDto = ProductImageInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del MediaAsset de la biblioteca.' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProductImageInputDto.prototype, "assetId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 255 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ProductImageInputDto.prototype, "altText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductImageInputDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false, description: 'Portada (solo una por producto).' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductImageInputDto.prototype, "isCover", void 0);
class CreateProductDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, maxLength: 255 }, slug: { required: false, type: () => String, maxLength: 255, pattern: "/^[a-z0-9]+(?:-[a-z0-9]+)*$/" }, description: { required: false, type: () => String }, shortDescription: { required: false, type: () => String, maxLength: 500 }, status: { required: false, type: () => Object }, hasVariants: { required: false, type: () => Boolean }, sortOrder: { required: false, type: () => Number, minimum: 0 }, featured: { required: false, type: () => Boolean }, metaTitle: { required: false, type: () => String, maxLength: 255 }, metaDescription: { required: false, type: () => String, maxLength: 500 }, categoryIds: { required: false, type: () => [String] }, optionTypes: { required: false, type: () => [require("./create-product.dto").OptionTypeInputDto] }, images: { required: false, type: () => [require("./create-product.dto").ProductImageInputDto] }, variants: { required: true, type: () => [require("./create-product.dto").VariantInputDto] } };
    }
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Camiseta básica' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Si se omite, se genera desde el nombre.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'El slug solo admite minúsculas, números y guiones simples.',
    }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateProductDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ProductStatus, default: client_1.ProductStatus.draft }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", String)
], CreateProductDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "hasVariants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "featured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProductDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateProductDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'IDs de categorías.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "categoryIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [OptionTypeInputDto], description: 'Máx 3 tipos de opción.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(3),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OptionTypeInputDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "optionTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ProductImageInputDto], description: 'Máx 20 imágenes.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductImageInputDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [VariantInputDto], description: 'Al menos una variante.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VariantInputDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "variants", void 0);
//# sourceMappingURL=create-product.dto.js.map