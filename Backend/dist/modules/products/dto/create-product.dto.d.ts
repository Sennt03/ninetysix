import { ProductStatus, StockPolicy } from '@prisma/client';
export declare class VariantOptionRefDto {
    optionType: string;
    value: string;
}
export declare class OptionTypeInputDto {
    name: string;
    values: string[];
    sortOrder?: number;
}
export declare class VariantInputDto {
    sku?: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    stock?: number;
    stockPolicy?: StockPolicy;
    weight?: number;
    color?: string;
    isDefault?: boolean;
    active?: boolean;
    sortOrder?: number;
    options?: VariantOptionRefDto[];
}
export declare class ProductImageInputDto {
    assetId: string;
    altText?: string;
    sortOrder?: number;
    isCover?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    status?: ProductStatus;
    hasVariants?: boolean;
    sortOrder?: number;
    featured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    categoryIds?: string[];
    optionTypes?: OptionTypeInputDto[];
    images?: ProductImageInputDto[];
    variants: VariantInputDto[];
}
