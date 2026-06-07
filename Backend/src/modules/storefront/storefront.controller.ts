import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { StorefrontService } from './storefront.service';

/**
 * API pública de la tienda (sin autenticación, solo lectura).
 * Devuelve únicamente datos seguros (sin costPrice, solo entidades activas).
 * Pensada para consumirse desde el SSR de Angular.
 */
@ApiTags('tienda · público')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get('home')
  @ApiOperation({ summary: 'Datos de la portada: colecciones + productos destacados' })
  home() {
    return this.storefront.getHome();
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Catálogo: todas las categorías activas' })
  catalog() {
    return this.storefront.getCatalog();
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Slugs activos (producto + categoría) para el sitemap.xml' })
  sitemap() {
    return this.storefront.getSitemap();
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Detalle de categoría + sus productos activos' })
  async category(@Param('slug') slug: string) {
    const category = await this.storefront.getCategory(slug);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Detalle público de un producto (variantes incluidas)' })
  async product(@Param('slug') slug: string) {
    const product = await this.storefront.getProduct(slug);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }
}
