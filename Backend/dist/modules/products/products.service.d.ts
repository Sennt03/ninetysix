import { ProductStatus, StockPolicy } from '@prisma/client';
import { ReorderItemDto } from '../../common/dto/reorder.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly media;
    constructor(prisma: PrismaService, media: MediaService);
    findAll(query: ProductQueryDto): Promise<PaginatedResult<ProductListItem>>;
    findOne(id: string): Promise<ProductDetail>;
    create(dto: CreateProductDto): Promise<ProductDetail>;
    update(id: string, dto: UpdateProductDto): Promise<ProductDetail>;
    remove(id: string): Promise<void>;
    duplicate(id: string): Promise<ProductDetail>;
    reorder(items: ReorderItemDto[]): Promise<void>;
    private writeOptionsAndVariants;
    private writeImages;
    private normalizeImages;
    private normalizeVariantImages;
    private normalizeDefaults;
    private assertComparePrices;
    private assertPublishable;
    private optKey;
    private slugExists;
    private assertSlugFree;
    private rethrow;
    private toListItem;
    private toDetail;
}
export interface ProductImageView {
    id: string;
    assetId: string;
    url: string;
    thumbnailUrl: string | null;
    altText: string | null;
    sortOrder: number;
    isCover: boolean;
    width: number | null;
    height: number | null;
}
export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    status: ProductStatus;
    featured: boolean;
    hasVariants: boolean;
    sortOrder: number;
    updatedAt: Date;
    coverImageUrl: string | null;
    price: number | null;
    sku: string | null;
    stock: number;
    categories: {
        id: string;
        name: string;
    }[];
}
export interface ProductVariantView {
    id: string;
    sku: string | null;
    price: number;
    comparePrice: number | null;
    costPrice: number | null;
    stock: number;
    stockPolicy: StockPolicy;
    weight: number | null;
    color: string | null;
    imageAssetId: string | null;
    isDefault: boolean;
    active: boolean;
    sortOrder: number;
    options: {
        optionType: string;
        value: string;
        optionValueId: string;
    }[];
}
export interface ProductDetail {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    status: ProductStatus;
    hasVariants: boolean;
    sortOrder: number;
    featured: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
    categories: {
        id: string;
        name: string;
        slug: string;
    }[];
    images: ProductImageView[];
    optionTypes: {
        id: string;
        name: string;
        sortOrder: number;
        values: {
            id: string;
            value: string;
            sortOrder: number;
        }[];
    }[];
    variants: ProductVariantView[];
}
