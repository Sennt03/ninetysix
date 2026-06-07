import { ImportJob } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { ProductsService } from '../products/products.service';
import { ImportJobsService } from './import-jobs.service';
import { ImportPreview } from './import.types';
export declare class ProductImportService {
    private readonly prisma;
    private readonly products;
    private readonly media;
    private readonly jobs;
    private readonly logger;
    constructor(prisma: PrismaService, products: ProductsService, media: MediaService, jobs: ImportJobsService);
    preview(source: string | Buffer): Promise<ImportPreview>;
    run(job: ImportJob): Promise<void>;
    private executeItem;
    private imagesWarning;
    private toVariantDto;
    private buildImages;
    private resolveCategories;
    private buildItems;
    private buildItem;
    private rawForError;
}
