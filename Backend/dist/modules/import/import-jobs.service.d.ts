import { ConfigService } from '@nestjs/config';
import { ImportJob, ImportJobType, ImportRowAction, ImportRowStatus, Prisma } from '@prisma/client';
import { AppConfig } from '../../config/configuration';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ImportJobsQueryDto, ImportRowsQueryDto } from './dto/import-jobs-query.dto';
export interface RowResult {
    rowNumber: number;
    identifier?: string | null;
    status: ImportRowStatus;
    action?: ImportRowAction;
    message?: string | null;
    rawData?: Prisma.InputJsonValue;
}
export declare class ImportJobsService {
    private readonly prisma;
    private readonly importsDir;
    constructor(prisma: PrismaService, config: ConfigService<AppConfig, true>);
    createJob(type: ImportJobType, file: Express.Multer.File, userId?: string): Promise<ImportJob>;
    markProcessing(id: string, totalRows: number): Promise<ImportJob>;
    recordRow(jobId: string, result: RowResult): Promise<void>;
    finalize(id: string): Promise<void>;
    markFailed(id: string, message: string): Promise<ImportJob>;
    history(query: ImportJobsQueryDto): Promise<PaginatedResult<ImportJob>>;
    getJob(id: string): Promise<ImportJob>;
    getRows(id: string, query: ImportRowsQueryDto): Promise<PaginatedResult<Prisma.ImportJobRowGetPayload<object>>>;
    buildErrorsFile(id: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
}
