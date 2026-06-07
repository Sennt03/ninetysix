import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
export interface ProductExportFilter {
    status?: ProductStatus[];
    search?: string;
    categoryId?: string;
    featured?: boolean;
    hasVariants?: boolean;
}
export declare class ExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    exportProducts(filter: ProductExportFilter): Promise<Buffer>;
    exportCategories(): Promise<Buffer>;
    private productRows;
    private headers;
    private toRow;
}
