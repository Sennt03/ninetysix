import { ImportJob } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CategoriesService } from '../categories/categories.service';
import { ImportJobsService } from './import-jobs.service';
import { ImportPreview } from './import.types';
export declare class CategoryImportService {
    private readonly prisma;
    private readonly categories;
    private readonly media;
    private readonly jobs;
    constructor(prisma: PrismaService, categories: CategoriesService, media: MediaService, jobs: ImportJobsService);
    preview(source: string | Buffer): Promise<ImportPreview>;
    run(job: ImportJob): Promise<void>;
    private upsert;
    private buildItem;
    private rawForError;
}
