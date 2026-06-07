import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class ProductQueryDto extends PaginationDto {
    search?: string;
    status?: ProductStatus[];
    categoryId?: string;
    featured?: boolean;
    hasVariants?: boolean;
}
