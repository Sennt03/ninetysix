import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportJob, ImportJobStatus, ImportJobType } from '@models/import.models';
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
import { debounceTime, distinctUntilChanged } from 'rxjs';

const TYPE_LABEL: Record<ImportJobType, string> = {
  products: 'Productos',
  categories: 'Categorías',
  images: 'Imágenes',
};

const STATUS_META: Record<ImportJobStatus, { label: string; cls: string }> = {
  pending: { label: 'En cola', cls: 'b-wait' },
  processing: { label: 'Procesando', cls: 'b-proc' },
  completed: { label: 'Completado', cls: 'b-ok' },
  completed_with_errors: { label: 'Con errores', cls: 'b-warn' },
  failed: { label: 'Fallido', cls: 'b-err' },
};

/** Historial de cargas masivas con acceso a incidencias y descarga de fallidas. */
@Component({
  selector: 'app-import-history',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    BreadcrumbComponent,
    DataTableComponent,
    DataTableCellDirective,
    ...materialImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './import-history.component.html',
  styleUrl: './import-history.component.scss',
})
export class ImportHistoryComponent {
  private readonly importService = inject(ImportService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly jobs = signal<ImportJob[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly typeFilter = signal<ImportJobType | ''>('');

  readonly crumbs: BreadcrumbItem[] = [
    { label: 'Carga masiva', link: '/panel/import' },
    { label: 'Historial' },
  ];

  readonly searchCtrl = new FormControl('', { nonNullable: true });

  readonly typeOptions: { value: ImportJobType | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'products', label: 'Productos' },
    { value: 'categories', label: 'Categorías' },
    { value: 'images', label: 'Imágenes' },
  ];

  readonly columns: DataTableColumn<ImportJob>[] = [
    { key: 'createdAt', header: 'Fecha' },
    { key: 'type', header: 'Tipo' },
    { key: 'status', header: 'Estado' },
    { key: 'processed', header: 'Procesado' },
    { key: 'details', header: 'Detalles' },
    { key: 'incidencias', header: 'Incidencias', align: 'center' },
    { key: 'actions', header: '', align: 'end', width: '56px' },
  ];

  constructor() {
    const qpType = inject(ActivatedRoute).snapshot.queryParams['type'] as ImportJobType | undefined;
    if (qpType) {
      this.typeFilter.set(qpType);
    }
    this.load();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.load();
      });
  }

  load(): void {
    this.loading.set(true);
    this.importService
      .history({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        type: this.typeFilter() || undefined,
        search: this.searchCtrl.value || undefined,
      })
      .subscribe({
        next: (res) => {
          this.jobs.set(res.items);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notify.error('No se pudo cargar el historial');
        },
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  setType(value: ImportJobType | ''): void {
    this.typeFilter.set(value);
    this.pageIndex.set(0);
    this.load();
  }

  openJob(job: ImportJob): void {
    this.router.navigate(['/panel/import/jobs', job.id]);
  }

  openIncidencias(job: ImportJob): void {
    this.router.navigate(['/panel/import/jobs', job.id], { queryParams: { tab: 'errors' } });
  }

  downloadErrors(job: ImportJob): void {
    this.importService.downloadErrors(job.id).subscribe({
      next: (blob) => saveBlob(blob, `${job.originalName.replace(/\.[^.]+$/, '')}-errores.xlsx`),
      error: () => this.notify.error('No se pudieron descargar las incidencias'),
    });
  }

  statusMeta(status: ImportJobStatus) {
    return STATUS_META[status];
  }

  typeLabel(type: ImportJobType): string {
    return TYPE_LABEL[type];
  }
}
