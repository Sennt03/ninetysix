import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * Actualización. Si se envían `optionTypes`/`variants`, se reemplazan los del
 * producto (Fase 1: estrategia de reemplazo; la sincronización fina que
 * preserva precios/SKU se afinará en una fase posterior). El slug NO se
 * regenera automáticamente.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
