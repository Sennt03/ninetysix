import { OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CategoryImportService } from './category-import.service';
import { ImageImportService } from './image-import.service';
import { ImportJobsService } from './import-jobs.service';
import { ProductImportService } from './product-import.service';
export declare class ImportWorkerService implements OnApplicationBootstrap {
    private readonly prisma;
    private readonly jobs;
    private readonly productImport;
    private readonly categoryImport;
    private readonly imageImport;
    private readonly logger;
    private readonly queue;
    private processing;
    constructor(prisma: PrismaService, jobs: ImportJobsService, productImport: ProductImportService, categoryImport: CategoryImportService, imageImport: ImageImportService);
    onApplicationBootstrap(): Promise<void>;
    enqueue(jobId: string): void;
    private tick;
    private process;
}
