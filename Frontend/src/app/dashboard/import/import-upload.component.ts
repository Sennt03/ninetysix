import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportPreview } from '@models/import.models';
import { ImportService } from '@services/import.service';
import { NotificationService } from '@services/notification.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@shared/components/breadcrumb/breadcrumb.component';
import { materialImports } from '@shared/material/material.imports';
import { saveBlob } from '@shared/utils/download';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { InstructionsDialogComponent, InstructionsData } from './instructions-dialog.component';

type ImportKind = 'products' | 'categories';

/** Pantalla de importación de productos o categorías (según data.type de la ruta). */
@Component({
  selector: 'app-import-upload',
  imports: [BreadcrumbComponent, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './import-upload.component.html',
  styleUrl: './import.scss',
})
export class ImportUploadComponent {
  private readonly importService = inject(ImportService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly kind = (inject(ActivatedRoute).snapshot.data['type'] as ImportKind) ?? 'products';

  readonly file = signal<File | null>(null);
  readonly preview = signal<ImportPreview | null>(null);
  readonly loadingPreview = signal(false);
  readonly importing = signal(false);
  readonly dragOver = signal(false);

  readonly title = computed(() =>
    this.kind === 'products' ? 'Importar productos' : 'Importar categorías',
  );
  readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: 'Carga masiva', link: '/panel/import' },
    { label: this.title() },
  ]);
  readonly canImport = computed(() => {
    const p = this.preview();
    return !!p && p.validItems > 0 && !this.importing();
  });

  onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0] ?? null;
    input.value = '';
    this.setFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  private setFile(file: File | null): void {
    if (!file) {
      return;
    }
    if (!/\.xlsx?$/i.test(file.name)) {
      this.notify.error('Selecciona un archivo Excel (.xlsx).');
      return;
    }
    this.file.set(file);
    this.preview.set(null);
    this.loadPreview(file);
  }

  private loadPreview(file: File): void {
    this.loadingPreview.set(true);
    const req =
      this.kind === 'products'
        ? this.importService.previewProducts(file)
        : this.importService.previewCategories(file);
    req.subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.loadingPreview.set(false);
      },
      error: (err) => {
        this.loadingPreview.set(false);
        this.file.set(null);
        this.notify.error(getApiErrorMessage(err, 'No se pudo leer el archivo'));
      },
    });
  }

  importNow(): void {
    const file = this.file();
    if (!file) {
      return;
    }
    this.importing.set(true);
    const req =
      this.kind === 'products'
        ? this.importService.importProducts(file)
        : this.importService.importCategories(file);
    req.subscribe({
      next: ({ jobId }) => {
        this.importing.set(false);
        this.notify.success('Importación iniciada. Procesando en segundo plano…');
        this.router.navigate(['/panel/import/jobs', jobId]);
      },
      error: (err) => {
        this.importing.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudo iniciar la importación'));
      },
    });
  }

  downloadTemplate(): void {
    this.importService.downloadTemplate(this.kind).subscribe({
      next: (blob) => saveBlob(blob, `plantilla-${this.kind}.xlsx`),
      error: () => this.notify.error('No se pudo descargar la plantilla'),
    });
  }

  openInstructions(): void {
    this.dialog.open(InstructionsDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      data: { type: this.kind } satisfies InstructionsData,
    });
  }

  goHistory(): void {
    this.router.navigate(['/panel/import/history'], { queryParams: { type: this.kind } });
  }

  /** Valor mostrado en una celda del preview (los arrays/errores se ignoran). */
  cell(row: Record<string, unknown>, key: string): string {
    const v = row[key];
    return v == null || Array.isArray(v) ? '' : String(v);
  }
}
