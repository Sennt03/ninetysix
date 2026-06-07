import { PaginationDto } from '../../../common/dto/pagination.dto';
export type MediaUsageFilter = 'all' | 'used' | 'unused';
export declare class MediaQueryDto extends PaginationDto {
    search?: string;
    usage: MediaUsageFilter;
}
