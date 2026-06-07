import { ImportJobType, ImportRowStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class ImportJobsQueryDto extends PaginationDto {
    type?: ImportJobType;
    search?: string;
}
export declare class ImportRowsQueryDto extends PaginationDto {
    status?: ImportRowStatus;
}
