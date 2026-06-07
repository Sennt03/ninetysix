import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ImportJob, ImportJobRow, ImportJobStatus, ImportRowStatus } from '@models/import.models';
import { ImportService } from '@services/import.service';
import { NotificationService } from '@services/notification.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@shared/components/breadcrumb/breadcrumb.component';
import {
  DataTableCellDirective,
  DataTableColumn,
  DataTableComponent,
} from '@shared/components/data-table/data-table.component';
import { materialImports } from '@shared/material/material.imports';
import { saveBlob } from '@shared/utils/download';
import { interval, startWith, switchMap, takeWhile } from 'rxjs';

const TERMINAL: ImportJobStatus[] = ['completed', 'completed_with_errors', 'failed'];

/** Detalle de un job: progreso en vivo (polling) + incidencias. */
@Component({
  selector: 'app-import-job-detail',
  imports: [
    DatePipe,
    BreadcrumbComponent,
    DataTableComponent,
    DataTableCellDirective,
    ...materialImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './import-job-detail.component.html',
  styleUrl: './import-job-detail.component.scss',
})
export class ImportJobDetailComponent {
  private readonly importService = inject(ImportService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  readonly id = this.route.snapshot.params['id'] as string;

  readonly job = signal<ImportJob | null>(null);
  readonly rows = signal<ImportJobRow[]>([]);
  readonly rowsTotal = signal(0);
  readonly rowsLoading = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly statusFilter = signal<ImportRowStatus | ''>('');

  readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Carga masiva', link: '/panel/import' },
    { label: 'Historial', link: '/panel/import/history' },
    { label: this.job()?.originalName ?? 'Detalle del proceso' },
  ]);

  readonly done = computed(() => {
    const j = this.job();
    return j ? TERMINAL.includes(j.status) : false;
  });
  readonly progress = computed(() => {
    const j = this.job();
    if (!j || !j.totalRows) {
      return 0;
    }
    return Math.round((j.processedRows / j.totalRows) * 100);
  });

  readonly rowColumns: DataTableColumn<ImportJobRow>[] = [
    { key: 'identifier', header: 'Identificador' },
    { key: 'status', header: 'Estado' },
    { key: 'action', header: 'Acción' },
    { key: 'message', header: 'Mensaje' },
  ];

  readonly statusOptions: { value: ImportRowStatus | ''; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'error', label: 'Errores' },
    { value: 'ok', label: 'Correctas' },
  ];

  constructor() {
    if (this.route.snapshot.queryParams['tab'] === 'errors') {
      this.statusFilter.set('error');
    }
    // Polling cada 2s hasta que el job termina.
    interval(2000)
      .pipe(
        startWith(0),
        switchMap(() => this.importService.job(this.id)),
        takeWhile((j) => !TERMINAL.includes(j.status), true),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (j) => {
          const wasDone = this.done();
          this.job.set(j);
          if (!wasDone && TERMINAL.includes(j.status)) {
            this.loadRows();
          }
        },
        error: () => this.notify.error('No se pudo cargar el proceso'),
      });
  }

  loadRows(): void {
    this.rowsLoading.set(true);
    this.importService
      .rows(this.id, {
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        status: this.statusFilter() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.items);
          this.rowsTotal.set(res.meta.total);
          this.rowsLoading.set(false);
        },
        error: () => this.rowsLoading.set(false),
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  setStatus(value: ImportRowStatus | ''): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadRows();
  }

  downloadErrors(): void {
    const job = this.job();
    if (!job) {
      return;
    }
    this.importService.downloadErrors(job.id).subscribe({
      next: (blob) => saveBlob(blob, `${job.originalName.replace(/\.[^.]+$/, '')}-errores.xlsx`),
      error: () => this.notify.error('No se pudieron descargar las incidencias'),
    });
  }

  typeLink(): string {
    const t = this.job()?.type;
    if (t === 'categories') {
      return '/categories/import';
    }
    if (t === 'images') {
      return '/products/images/import';
    }
    return '/products/import';
  }
}
