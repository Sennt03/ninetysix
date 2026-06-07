import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MediaAssetDetail } from '@models/media.models';
import { MediaService } from '@services/media.service';
import { NotificationService } from '@services/notification.service';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';

export interface MediaDetailData {
  id: string;
}

@Component({
  selector: 'app-media-detail-dialog',
  imports: [MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Detalle de la imagen</h2>
    <mat-dialog-content class="detail">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (asset(); as a) {
        <div class="detail__preview">
          <img [src]="a.url" [alt]="a.originalName ?? 'imagen'" />
        </div>
        <dl class="detail__meta">
          <div><dt>Nombre</dt><dd>{{ a.originalName ?? '—' }}</dd></div>
          <div><dt>Tamaño</dt><dd>{{ formatSize(a.sizeBytes) }}</dd></div>
          <div><dt>Dimensiones</dt><dd>{{ a.width ?? '?' }} × {{ a.height ?? '?' }} px</dd></div>
          <div><dt>Tipo</dt><dd>{{ a.mimeType }}</dd></div>
        </dl>

        @if (a.usage.products.length || a.usage.categories.length) {
          <div class="detail__usage">
            <p class="detail__usage-title">
              <mat-icon>info</mat-icon>
              En uso — no se puede eliminar desde aquí. Quítala primero desde:
            </p>
            @if (a.usage.products.length) {
              <p class="detail__usage-group">Productos:</p>
              <div class="detail__chips">
                @for (p of a.usage.products; track p.id) {
                  <button mat-stroked-button type="button" (click)="goToProduct(p.id)">
                    <mat-icon>open_in_new</mat-icon> {{ p.name }}
                  </button>
                }
              </div>
            }
            @if (a.usage.categories.length) {
              <p class="detail__usage-group">Categorías:</p>
              <div class="detail__chips">
                @for (c of a.usage.categories; track c.id) {
                  <span class="detail__cat">{{ c.name }}</span>
                }
              </div>
            }
          </div>
        } @else {
          <p class="detail__free">Esta imagen no está asignada a ningún producto ni categoría.</p>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
      <button
        mat-flat-button
        color="warn"
        (click)="remove()"
        [disabled]="deleting() || !asset() || isInUse()"
      >
        <mat-icon>delete</mat-icon>
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './media-detail-dialog.component.scss',
})
export class MediaDetailDialogComponent {
  private readonly media = inject(MediaService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialogRef =
    inject<MatDialogRef<MediaDetailDialogComponent, 'deleted'>>(MatDialogRef);
  private readonly data = inject<MediaDetailData>(MAT_DIALOG_DATA);

  readonly asset = signal<MediaAssetDetail | null>(null);
  readonly loading = signal(true);
  readonly deleting = signal(false);

  constructor() {
    this.media.get(this.data.id).subscribe({
      next: (a) => {
        this.asset.set(a);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(getApiErrorMessage(err));
        this.dialogRef.close();
      },
    });
  }

  isInUse(): boolean {
    const a = this.asset();
    return !!a && (a.usage.products.length > 0 || a.usage.categories.length > 0);
  }

  goToProduct(id: string): void {
    this.dialogRef.close();
    this.router.navigate(['/panel/products', id, 'edit']);
  }

  remove(): void {
    const a = this.asset();
    if (!a) {
      return;
    }
    this.deleting.set(true);
    this.media.remove(a.id).subscribe({
      next: () => {
        this.notify.success('Imagen eliminada');
        this.dialogRef.close('deleted');
      },
      error: (err) => {
        this.deleting.set(false);
        this.notify.error(getApiErrorMessage(err));
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  }
}
