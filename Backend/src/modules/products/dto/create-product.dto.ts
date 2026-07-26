import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, StockPolicy } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Referencia de una variante a un valor de opción (por nombre de tipo + valor). */
export class VariantOptionRefDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  optionType: string;

  @ApiProperty({ example: 'Rojo' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class OptionTypeInputDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ type: [String], example: ['Rojo', 'Azul'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  values: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class VariantInputDto {
  @ApiPropertyOptional({ description: 'Único si se indica.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ example: 19.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Debe ser > price.' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Solo admin; nunca en API pública.' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ enum: StockPolicy, default: StockPolicy.deny })
  @IsOptional()
  @IsEnum(StockPolicy)
  stockPolicy?: StockPolicy;

  @ApiPropertyOptional({ description: 'Gramos.' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Color hex de la variante, p.ej. #FF5733.' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un hex válido como #FF5733.' })
  color?: string;

  @ApiPropertyOptional({
    description:
      'Asset (de las imágenes del producto) al que salta la galería al elegir la variante.',
  })
  @IsOptional()
  @IsUUID()
  imageAssetId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: [VariantOptionRefDto],
    description: 'Combinación (modo variantes).',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionRefDto)
  options?: VariantOptionRefDto[];
}

/** Imagen de un producto: referencia a un asset de la biblioteca + metadatos del vínculo. */
export class ProductImageInputDto {
  @ApiProperty({ description: 'ID del MediaAsset de la biblioteca.' })
  @IsUUID()
  assetId: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: false, description: 'Portada (solo una por producto).' })
  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Camiseta básica' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Si se omite, se genera desde el nombre.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo admite minúsculas, números y guiones simples.',
  })
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.draft })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String], description: 'IDs de categorías.' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [OptionTypeInputDto], description: 'Máx 3 tipos de opción.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => OptionTypeInputDto)
  optionTypes?: OptionTypeInputDto[];

  @ApiPropertyOptional({ type: [ProductImageInputDto], description: 'Máx 20 imágenes.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[];

  @ApiProperty({ type: [VariantInputDto], description: 'Al menos una variante.' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants: VariantInputDto[];
}
