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
import { CategoryStatus } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { Role } from '../../common/enums/role.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('admin · categorías')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Árbol de categorías (o lista plana con ?flat=true)' })
  findAll(
    @Query('flat') flat?: string,
    @Query('status') status?: CategoryStatus,
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
  ) {
    if (flat === 'true') {
      return this.categoriesService.findFlat({ status, parentId, search });
    }
    return this.categoriesService.findTree();
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reordenar categorías (batch sortOrder)' })
  reorder(@Body() dto: ReorderDto) {
    return this.categoriesService.reorder(dto.items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de categoría' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar categoría (reasignación opcional por query)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reassignChildrenTo') reassignChildrenTo?: string,
    @Query('reassignProductsTo') reassignProductsTo?: string,
  ) {
    return this.categoriesService.remove(id, { reassignChildrenTo, reassignProductsTo });
  }
}
