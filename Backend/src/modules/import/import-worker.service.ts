import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ImportJobStatus, ImportJobType } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CategoryImportService } from './category-import.service';
import { ImageImportService } from './image-import.service';
import { ImportJobsService } from './import-jobs.service';
import { ProductImportService } from './product-import.service';

/**
 * Worker en proceso (sin Redis): procesa los jobs de uno en uno en segundo
 * plano. Al arrancar reencola los jobs que quedaron a medias (un reinicio del
 * servidor no pierde trabajos). El front sigue el progreso por polling.
 */
@Injectable()
export class ImportWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ImportWorkerService.name);
  private readonly queue: string[] = [];
  private processing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: ImportJobsService,
    private readonly productImport: ProductImportService,
    private readonly categoryImport: CategoryImportService,
    private readonly imageImport: ImageImportService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const pending = await this.prisma.importJob.findMany({
      where: { status: { in: [ImportJobStatus.pending, ImportJobStatus.processing] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!pending.length) {
      return;
    }
    // Los que quedaron "processing" se reinician a pending para reprocesar limpio.
    await this.prisma.importJob.updateMany({
      where: { status: ImportJobStatus.processing },
      data: { status: ImportJobStatus.pending, processedRows: 0, successCount: 0, errorCount: 0, createdCount: 0, updatedCount: 0 },
    });
    // Y se borran sus incidencias previas (idempotencia del reprocesado).
    await this.prisma.importJobRow.deleteMany({ where: { jobId: { in: pending.map((p) => p.id) } } });
    this.logger.log(`Reencolando ${pending.length} job(s) de importación pendientes`);
    for (const p of pending) {
      this.enqueue(p.id);
    }
  }

  /** Encola un job y dispara el procesamiento. */
  enqueue(jobId: string): void {
    this.queue.push(jobId);
    void this.tick();
  }

  private async tick(): Promise<void> {
    if (this.processing) {
      return;
    }
    const id = this.queue.shift();
    if (!id) {
      return;
    }
    this.processing = true;
    try {
      await this.process(id);
    } catch (e) {
      this.logger.error(`Fallo procesando job ${id}: ${(e as Error).message}`);
    } finally {
      this.processing = false;
      void this.tick();
    }
  }

  private async process(id: string): Promise<void> {
    const job = await this.prisma.importJob.findUnique({ where: { id } });
    if (!job) {
      return;
    }
    this.logger.log(`Procesando job ${id} (${job.type})`);
    try {
      switch (job.type) {
        case ImportJobType.products:
          await this.productImport.run(job);
          break;
        case ImportJobType.categories:
          await this.categoryImport.run(job);
          break;
        case ImportJobType.images:
          await this.imageImport.run(job);
          break;
      }
    } catch (e) {
      await this.jobs.markFailed(id, (e as Error).message);
      this.logger.error(`Job ${id} marcado como failed: ${(e as Error).message}`);
    }
  }
}
