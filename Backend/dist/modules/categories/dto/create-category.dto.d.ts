import { CategoryStatus } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string | null;
    imageAssetId?: string | null;
    imageAlt?: string;
    sortOrder?: number;
    status?: CategoryStatus;
    metaTitle?: string;
    metaDescription?: string;
}
