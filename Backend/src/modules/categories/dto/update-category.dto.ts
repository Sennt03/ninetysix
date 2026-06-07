import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * Todos los campos son opcionales. El slug NO se regenera automáticamente
 * desde el nombre (para no romper URLs ya indexadas); solo cambia si se envía.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
