import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ImportService } from '@services/import.service';
import { NotificationService } from '@services/notification.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@shared/components/breadcrumb/breadcrumb.component';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';

/** Carga masiva de imágenes por ZIP (match por SKU/slug). */
@Component({
  selector: 'app-import-images',
  imports: [RouterLink, BreadcrumbComponent, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './import.scss',
  template: `
    <section class="imp">
      <header class="imp__header">
        <div class="imp__heading">
          <app-breadcrumb [items]="crumbs" />
          <h1 class="imp__title">Carga de imágenes</h1>
        </div>
        <div class="imp__actions">
          <button mat-stroked-button routerLink="/panel/import/history" [queryParams]="{ type: 'images' }">
            <mat-icon>history</mat-icon> Historial
          </button>
        </div>
      </header>

      <mat-card appearance="outlined" class="imp__card">
        <div
          class="dropzone"
          [class.dropzone--over]="dragOver()"
          (drop)="onDrop($event)"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
        >
          <button mat-flat-button color="primary" (click)="fileInput.click()" [disabled]="uploading()">
            <mat-icon>folder_zip</mat-icon> Seleccione el ZIP
          </button>
          <span class="dropzone__name">{{ file()?.name ?? 'No se ha seleccionado un archivo.' }}</span>
          <small>Un archivo .zip con las imágenes nombradas por SKU o slug.</small>
          <input #fileInput type="file" hidden accept=".zip" (change)="onFileSelected(fileInput)" />
        </div>

        <p class="imp__note">
          <mat-icon>info</mat-icon>
          <span>
            Nombra cada imagen con el <strong>SKU</strong> de la variante o el
            <strong>slug</strong> del producto. La portada es el archivo base
            (<code>SER-01.jpg</code>) y las secundarias llevan sufijo numérico
            (<code>SER-01-2.jpg</code>, <code>SER-01-3.jpg</code>). Las imágenes se añaden a las
            existentes; las fotos repetidas no se duplican.
          </span>
        </p>

        @if (uploading()) {
          <mat-progress-bar mode="indeterminate" />
        }

        <div class="imp__summary">
          <span class="imp__spacer"></span>
          <button mat-flat-button color="primary" [disabled]="!file() || uploading()" (click)="upload()">
            <mat-icon>play_arrow</mat-icon> Subir y asociar
          </button>
        </div>
      </mat-card>
    </section>
  `,
})
export class ImportImagesComponent {
  private readonly importService = inject(ImportService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly crumbs: BreadcrumbItem[] = [
    { label: 'Carga masiva', link: '/panel/import' },
    { label: 'Cargar imágenes' },
  ];

  readonly file = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);

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
    if (!/\.zip$/i.test(file.name)) {
      this.notify.error('Selecciona un archivo .zip.');
      return;
    }
    this.file.set(file);
  }

  upload(): void {
    const file = this.file();
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.importService.importImages(file).subscribe({
      next: ({ jobId }) => {
        this.uploading.set(false);
        this.notify.success('Procesando imágenes en segundo plano…');
        this.router.navigate(['/panel/import/jobs', jobId]);
      },
      error: (err) => {
        this.uploading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudo iniciar la carga'));
      },
    });
  }
}
