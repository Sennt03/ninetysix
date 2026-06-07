import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MediaAsset, MediaUsageFilter } from '@models/media.models';
import { MediaService } from '@services/media.service';
import { NotificationService } from '@services/notification.service';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface MediaPickerData {
  /** true = selección múltiple (productos); false = una sola (categorías). */
  multiple: boolean;
  /** Assets ya seleccionados fuera del diálogo (se marcan como ya añadidos). */
  excludeIds?: string[];
}

@Component({
  selector: 'app-media-picker-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './media-picker-dialog.component.html',
  styleUrl: './media-picker-dialog.component.scss',
})
export class MediaPickerDialogComponent {
  private readonly media = inject(MediaService);
  private readonly notify = inject(NotificationService);
  private readonly dialogRef =
    inject<MatDialogRef<MediaPickerDialogComponent, MediaAsset[]>>(MatDialogRef);
  readonly data = inject<MediaPickerData>(MAT_DIALOG_DATA);

  readonly assets = signal<MediaAsset[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(24);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly usageFilter = signal<MediaUsageFilter>('all');

  /** Map id -> asset de los seleccionados dentro del diálogo. */
  private readonly selectedMap = signal(new Map<string, MediaAsset>());
  readonly selectedCount = computed(() => this.selectedMap().size);

  private readonly excluded = new Set(this.data.excludeIds ?? []);

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

  isExcluded(asset: MediaAsset): boolean {
    return this.excluded.has(asset.id);
  }

  isSelected(asset: MediaAsset): boolean {
    return this.selectedMap().has(asset.id);
  }

  toggle(asset: MediaAsset): void {
    if (this.isExcluded(asset)) {
      return;
    }
    const map = new Map(this.selectedMap());
    if (map.has(asset.id)) {
      map.delete(asset.id);
    } else {
      if (!this.data.multiple) {
        map.clear();
      }
      map.set(asset.id, asset);
    }
    this.selectedMap.set(map);
  }

  onFilesSelected(input: HTMLInputElement): void {
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) {
      return;
    }
    this.uploading.set(true);
    this.media.upload(files).subscribe({
      next: (created) => {
        this.uploading.set(false);
        this.assets.update((list) => [...created, ...list]);
        this.total.update((t) => t + created.length);
        // Selecciona automáticamente lo recién subido.
        const map = new Map(this.data.multiple ? this.selectedMap() : new Map());
        for (const a of created) {
          if (!this.data.multiple) {
            map.clear();
          }
          map.set(a.id, a);
        }
        this.selectedMap.set(map);
        this.notify.success(`${created.length} imagen(es) subida(s)`);
      },
      error: (err) => {
        this.uploading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudieron subir las imágenes'));
      },
    });
  }

  confirm(): void {
    this.dialogRef.close([...this.selectedMap().values()]);
  }
}
