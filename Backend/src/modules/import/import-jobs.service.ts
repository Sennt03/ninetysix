import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ImportJob,
  ImportJobStatus,
  ImportJobType,
  ImportRowAction,
  ImportRowStatus,
  Prisma,
} from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { AppConfig } from '../../config/configuration';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ImportJobsQueryDto, ImportRowsQueryDto } from './dto/import-jobs-query.dto';
import { buildWorkbook, workbookToBuffer } from './xlsx.util';

/** Datos que registra el procesador por cada entidad procesada. */
export interface RowResult {
  rowNumber: number;
  identifier?: string | null;
  status: ImportRowStatus;
  action?: ImportRowAction;
  message?: string | null;
  rawData?: Prisma.InputJsonValue;
}

/**
 * Persistencia y consulta de los trabajos de importación e incidencias.
 * No procesa: solo crea jobs, escribe el archivo en disco, actualiza contadores
 * y sirve el historial. El procesamiento vive en los *-import.service + worker.
 */
@Injectable()
export class ImportJobsService {
  private readonly importsDir: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.importsDir = join(resolve(config.get('uploads.dir', { infer: true })), 'imports');
  }

  /** Guarda el archivo en disco y crea el job en estado pending. */
  async createJob(
    type: ImportJobType,
    file: Express.Multer.File,
    userId?: string,
  ): Promise<ImportJob> {
    await mkdir(this.importsDir, { recursive: true });
    const job = await this.prisma.importJob.create({
      data: { type, originalName: file.originalname ?? 'archivo', filePath: '', userId },
    });
    const ext = type === ImportJobType.images ? 'zip' : 'xlsx';
    const filePath = join(this.importsDir, `${job.id}.${ext}`);
    await writeFile(filePath, file.buffer);
    return this.prisma.importJob.update({ where: { id: job.id }, data: { filePath } });
  }

  // ----------------------------- ciclo de vida -----------------------------

  markProcessing(id: string, totalRows: number): Promise<ImportJob> {
    return this.prisma.importJob.update({
      where: { id },
      data: { status: ImportJobStatus.processing, startedAt: new Date(), totalRows },
    });
  }

  /** Registra el resultado de una entidad y actualiza los contadores del job. */
  async recordRow(jobId: string, result: RowResult): Promise<void> {
    const ok = result.status === ImportRowStatus.ok;
    const created = result.action === ImportRowAction.created;
    const updated = result.action === ImportRowAction.updated;
    await this.prisma.$transaction([
      this.prisma.importJobRow.create({
        data: {
          jobId,
          rowNumber: result.rowNumber,
          identifier: result.identifier ?? null,
          status: result.status,
          action: result.action ?? ImportRowAction.none,
          message: result.message?.slice(0, 500) ?? null,
          rawData: result.rawData ?? Prisma.JsonNull,
        },
      }),
      this.prisma.importJob.update({
        where: { id: jobId },
        data: {
          processedRows: { increment: 1 },
          successCount: { increment: ok ? 1 : 0 },
          errorCount: { increment: ok ? 0 : 1 },
          createdCount: { increment: created ? 1 : 0 },
          updatedCount: { increment: updated ? 1 : 0 },
        },
      }),
    ]);
  }

  /** Cierra el job: completed o completed_with_errors según las incidencias. */
  async finalize(id: string): Promise<void> {
    const job = await this.prisma.importJob.findUnique({ where: { id } });
    if (!job) {
      return;
    }
    await this.prisma.importJob.update({
      where: { id },
      data: {
        status:
          job.errorCount > 0
            ? ImportJobStatus.completed_with_errors
            : ImportJobStatus.completed,
        finishedAt: new Date(),
      },
    });
  }

  /** Marca el job como fallido (archivo ilegible / error global). */
  markFailed(id: string, message: string): Promise<ImportJob> {
    return this.prisma.importJob.update({
      where: { id },
      data: {
        status: ImportJobStatus.failed,
        message: message.slice(0, 500),
        finishedAt: new Date(),
      },
    });
  }

  // ------------------------------- consultas -------------------------------

  async history(query: ImportJobsQueryDto): Promise<PaginatedResult<ImportJob>> {
    const { page, limit, skip } = query;
    const where: Prisma.ImportJobWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.search && { originalName: { contains: query.search } }),
    };
    const [items, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.importJob.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async getJob(id: string): Promise<ImportJob> {
    const job = await this.prisma.importJob.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Proceso de carga no encontrado');
    }
    return job;
  }

  async getRows(
    id: string,
    query: ImportRowsQueryDto,
  ): Promise<PaginatedResult<Prisma.ImportJobRowGetPayload<object>>> {
    await this.getJob(id);
    const { page, limit, skip } = query;
    const where: Prisma.ImportJobRowWhereInput = {
      jobId: id,
      ...(query.status && { status: query.status }),
    };
    const [items, total] = await Promise.all([
      this.prisma.importJobRow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rowNumber: 'asc' },
      }),
      this.prisma.importJobRow.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  /**
   * Genera un .xlsx con SOLO las filas fallidas (a partir de rawData) más una
   * columna "Error" con el motivo, para que el admin lo corrija y lo resuba.
   */
  async buildErrorsFile(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const job = await this.getJob(id);
    const rows = await this.prisma.importJobRow.findMany({
      where: { jobId: id, status: ImportRowStatus.error },
      orderBy: { rowNumber: 'asc' },
    });

    // Cada incidencia puede traer varias filas originales (__rows) — p.ej. un
    // producto con variantes ocupa varias filas. Se expanden todas para que el
    // archivo de fallidas sea re-importable tal cual (tras corregir el motivo).
    const expanded: { data: Record<string, string>; error: string }[] = [];
    const headerSet = new Set<string>();
    for (const r of rows) {
      const raw = r.rawData as Record<string, unknown> | null;
      const subRows: Record<string, string>[] =
        raw && Array.isArray(raw.__rows)
          ? (raw.__rows as Record<string, string>[])
          : [(raw as Record<string, string>) ?? {}];
      for (const data of subRows) {
        Object.keys(data).forEach((k) => headerSet.add(k));
        expanded.push({ data, error: r.message ?? '' });
      }
    }
    const headers = [...headerSet, 'Error'];
    const body = expanded.map((e) =>
      headers.map((h) => (h === 'Error' ? e.error : (e.data[h] ?? ''))),
    );

    const wb = buildWorkbook('Errores', headers, body);
    const buffer = await workbookToBuffer(wb);
    const base = job.originalName.replace(/\.[^.]+$/, '');
    return { buffer, filename: `${base}-errores.xlsx` };
  }
}
