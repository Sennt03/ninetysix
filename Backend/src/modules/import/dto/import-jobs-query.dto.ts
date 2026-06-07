import { ApiPropertyOptional } from '@nestjs/swagger';
import { ImportJobType, ImportRowStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** Filtros + paginación del historial de cargas masivas. */
export class ImportJobsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ImportJobType })
  @IsOptional()
  @IsEnum(ImportJobType)
  type?: ImportJobType;

  @ApiPropertyOptional({ description: 'Busca en el nombre del archivo.' })
  @IsOptional()
  @IsString()
  search?: string;
}

/** Filtros + paginación de las incidencias de un job. */
export class ImportRowsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ImportRowStatus, description: 'Filtra por estado de fila.' })
  @IsOptional()
  @IsEnum(ImportRowStatus)
  status?: ImportRowStatus;
}
