import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MediaAsset, MediaUsageFilter } from '@models/media.models';
import { MediaService } from '@services/media.service';
import { NotificationService } from '@services/notification.service';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  MediaDetailData,
  MediaDetailDialogComponent,
} from './media-detail-dialog.component';

@Component({
  selector: 'app-media',
  imports: [ReactiveFormsModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss',
})
export class MediaComponent {
  private readonly media = inject(MediaService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly assets = signal<MediaAsset[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(24);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly usageFilter = signal<MediaUsageFilter>('all');

  readonly usageOptions: { value: MediaUsageFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'unused', label: 'Sin usar' },
    { value: 'used', label: 'En uso' },
  ];

  constructor() {
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
    this.media
      .list({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        search: this.searchCtrl.value || undefined,
        usage: this.usageFilter(),
      })
      .subscribe({
        next: (res) => {
          this.assets.set(res.items);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notify.error(getApiErrorMessage(err, 'No se pudo cargar la biblioteca'));
        },
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  setUsage(value: MediaUsageFilter): void {
    this.usageFilter.set(value);
    this.pageIndex.set(0);
    this.load();
  }

  onFilesSelected(input: HTMLInputElement): void {
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    this.upload(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
    this.upload(files.filter((f) => f.type.startsWith('image/')));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  openDetail(asset: MediaAsset): void {
    this.dialog
      .open(MediaDetailDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        data: { id: asset.id } satisfies MediaDetailData,
      })
      .afterClosed()
      .subscribe((result?: 'deleted') => {
        if (result === 'deleted') {
          this.load();
        }
      });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }

  private upload(files: File[]): void {
    if (!files.length) {
      return;
    }
    this.uploading.set(true);
    this.media.upload(files).subscribe({
      next: (created) => {
        this.uploading.set(false);
        this.notify.success(`${created.length} imagen(es) subida(s)`);
        this.pageIndex.set(0);
        this.load();
      },
      error: (err) => {
        this.uploading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudieron subir las imágenes'));
      },
    });
  }
}
