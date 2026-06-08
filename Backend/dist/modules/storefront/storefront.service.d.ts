import { PrismaService } from '../../database/prisma/prisma.service';
export interface StoreProductCard {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    imageAlt: string | null;
    price: number | null;
    comparePrice: number | null;
    inStock: boolean;
    colors: string[];
    categoryName: string | null;
    createdAt: string;
}
export interface StoreCollection {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    productCount: number;
    metaTitle: string | null;
    metaDescription: string | null;
}
export interface StoreHomePayload {
    collections: StoreCollection[];
    featuredProducts: StoreProductCard[];
}
export interface StoreCatalogPayload {
    categories: StoreCollection[];
}
export interface StoreCategoryDetail extends StoreCollection {
    products: StoreProductCard[];
}
export interface StoreProductVariant {
    id: string;
    sku: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    stockPolicy: string;
    color: string | null;
    isDefault: boolean;
    options: {
        optionType: string;
        value: string;
    }[];
}
export interface StoreProductDetail {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    hasVariants: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    categories: {
        name: string;
        slug: string;
    }[];
    images: {
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
    }[];
    optionTypes: {
        name: string;
        values: string[];
    }[];
    variants: StoreProductVariant[];
}
export interface StoreSitemap {
    products: {
        slug: string;
        updatedAt: string;
    }[];
    categories: {
        slug: string;
        updatedAt: string;
    }[];
}
export declare class StorefrontService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getHome(): Promise<StoreHomePayload>;
    getCatalog(): Promise<StoreCatalogPayload>;
    getProducts(categorySlug?: string): Promise<StoreProductCard[]>;
    getFeatured(): Promise<StoreProductCard[]>;
    getCategory(slug: string): Promise<StoreCategoryDetail | null>;
    getProduct(slug: string): Promise<StoreProductDetail | null>;
    getSitemap(): Promise<StoreSitemap>;
    private activeCategoryAndDescendants;
    private toCollection;
    private toCard;
    private toDetail;
}
