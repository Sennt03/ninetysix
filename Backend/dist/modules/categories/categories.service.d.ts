import { CategoryStatus } from '@prisma/client';
import { ReorderItemDto } from '../../common/dto/reorder.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    parentName?: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    sortOrder: number;
    status: CategoryStatus;
    metaTitle: string | null;
    metaDescription: string | null;
    imageAssetId: string | null;
    productCount: number;
    createdAt: Date;
    updatedAt: Date;
    children: CategoryNode[];
}
export interface DeleteCategoryOptions {
    reassignChildrenTo?: string;
    reassignProductsTo?: string;
}
export declare class CategoriesService {
    private readonly prisma;
    private readonly media;
    constructor(prisma: PrismaService, media: MediaService);
    findTree(): Promise<CategoryNode[]>;
    findFlat(params: {
        status?: CategoryStatus;
        parentId?: string;
        search?: string;
    }): Promise<CategoryNode[]>;
    findOne(id: string): Promise<CategoryNode>;
    create(dto: CreateCategoryDto): Promise<CategoryNode>;
    update(id: string, dto: UpdateCategoryDto): Promise<CategoryNode>;
    remove(id: string, opts: DeleteCategoryOptions): Promise<void>;
    reorder(items: ReorderItemDto[]): Promise<void>;
    private resolveImageUrl;
    private toNode;
    private ensureExists;
    private slugExists;
    private assertSlugFree;
    private loadGraph;
    private depthOf;
    private collectDescendants;
    private subtreeHeight;
    private validateParentChange;
}
