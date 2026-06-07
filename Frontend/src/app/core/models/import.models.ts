export type ImportJobType = 'products' | 'categories' | 'images';
export type ImportJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'completed_with_errors'
  | 'failed';
export type ImportRowStatus = 'ok' | 'error' | 'skipped';
export type ImportRowAction = 'created' | 'updated' | 'none';

/** Proceso de carga masiva (fila del historial). */
export interface ImportJob {
  id: string;
  type: ImportJobType;
  originalName: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  createdCount: number;
  updatedCount: number;
  message: string | null;
  userId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

/** Incidencia (resultado de una entidad procesada). */
export interface ImportJobRow {
  id: string;
  jobId: string;
  rowNumber: number;
  identifier: string | null;
  status: ImportRowStatus;
  action: ImportRowAction;
  message: string | null;
}

export interface PreviewColumn {
  key: string;
  header: string;
}

export type PreviewRow = {
  _row: number;
  _errors: string[];
} & Record<string, string | number | null | string[]>;

/** Resultado del dry-run (preview) de un archivo. */
export interface ImportPreview {
  type: 'products' | 'categories';
  totalRows: number;
  totalItems: number;
  validItems: number;
  invalidItems: number;
  truncated: boolean;
  columns: PreviewColumn[];
  rows: PreviewRow[];
}

/** Definición de columna para el diálogo de instrucciones. */
export interface ImportColumn {
  key: string;
  header: string;
  required?: boolean;
  help: string;
  example?: string;
  aliases?: string[];
}

export interface ImportJobsQuery {
  page?: number;
  limit?: number;
  type?: ImportJobType;
  search?: string;
}

export interface ImportRowsQuery {
  page?: number;
  limit?: number;
  status?: ImportRowStatus;
}
