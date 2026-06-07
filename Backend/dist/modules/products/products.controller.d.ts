import { ReorderDto } from '../../common/dto/reorder.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly products;
    constructor(products: ProductsService);
    findAll(query: ProductQueryDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./products.service").ProductListItem>>;
    create(dto: CreateProductDto): Promise<import("./products.service").ProductDetail>;
    reorder(dto: ReorderDto): Promise<void>;
    findOne(id: string): Promise<import("./products.service").ProductDetail>;
    update(id: string, dto: UpdateProductDto): Promise<import("./products.service").ProductDetail>;
    patch(id: string, dto: UpdateProductDto): Promise<import("./products.service").ProductDetail>;
    duplicate(id: string): Promise<import("./products.service").ProductDetail>;
    remove(id: string): Promise<void>;
}
