import { ImportJob } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { ImportJobsService } from './import-jobs.service';
export declare class ImageImportService {
    private readonly prisma;
    private readonly media;
    private readonly jobs;
    constructor(prisma: PrismaService, media: MediaService, jobs: ImportJobsService);
    run(job: ImportJob): Promise<void>;
    private attachImages;
    private buildResolver;
    private matchCode;
    private stripSuffix;
    private readZip;
}
