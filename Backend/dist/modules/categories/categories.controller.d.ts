import { CategoryStatus } from '@prisma/client';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(flat?: string, status?: CategoryStatus, parentId?: string, search?: string): Promise<import("./categories.service").CategoryNode[]>;
    create(dto: CreateCategoryDto): Promise<import("./categories.service").CategoryNode>;
    reorder(dto: ReorderDto): Promise<void>;
    findOne(id: string): Promise<import("./categories.service").CategoryNode>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("./categories.service").CategoryNode>;
    remove(id: string, reassignChildrenTo?: string, reassignProductsTo?: string): Promise<void>;
}
