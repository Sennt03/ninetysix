import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export type MediaUsageFilter = 'all' | 'used' | 'unused';

/** Filtros + paginación del listado de la biblioteca de archivos. */
export class MediaQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Busca en el nombre original del archivo.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['all', 'used', 'unused'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'used', 'unused'])
  usage: MediaUsageFilter = 'all';
}
