import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { Role } from '../../common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('admin · productos')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listado con filtros, búsqueda y paginación' })
  findAll(@Query() query: ProductQueryDto) {
    return this.products.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear producto (con variantes y opciones)' })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reordenar productos (batch sortOrder)' })
  reorder(@Body() dto: ReorderDto) {
    return this.products.reorder(dto.items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle completo (variantes, opciones, imágenes)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar producto (completo)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto (parcial)' })
  patch(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar producto' })
  duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.duplicate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }
}
