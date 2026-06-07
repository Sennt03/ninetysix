import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Category, CategoryPayload } from '@models/category.models';
import { MediaAsset } from '@models/media.models';
import { CategoriesService } from '@services/categories.service';
import { MediaService } from '@services/media.service';
import { NotificationService } from '@services/notification.service';
import {
  MediaPickerData,
  MediaPickerDialogComponent,
} from '../media/media-picker-dialog.component';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { slugify } from '@shared/utils/slug';

export interface CategoryFormData {
  category: Category | null;
  all: Category[];
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

@Component({
  selector: 'app-category-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
})
export class CategoryFormDialogComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<CategoryFormDialogComponent, boolean>>(MatDialogRef);
  private readonly data = inject<CategoryFormData>(MAT_DIALOG_DATA);
  private readonly categoriesService = inject(CategoriesService);
  private readonly mediaService = inject(MediaService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly isEdit = !!this.data.category;
  readonly saving = signal(false);
  readonly uploadingImage = signal(false);
  readonly slugLocked = signal(this.isEdit); // en edición no se autogenera
  readonly parentOptions = this.computeParentOptions();

  /** Imagen única de la categoría (asset de la biblioteca). */
  readonly selectedAsset = signal<{ id: string; url: string } | null>(null);

  /** Asset subido con "Subir" en esta sesión y aún no guardado (se limpia si se descarta). */
  private uploadedThisSession: string | null = null;
  private saved = false;

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    slug: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(SLUG_PATTERN)]),
    parentId: this.fb.control<string | null>(null),
    description: this.fb.nonNullable.control('', [Validators.maxLength(2000)]),
    imageAlt: this.fb.nonNullable.control(''),
    active: this.fb.nonNullable.control(true),
    metaTitle: this.fb.nonNullable.control('', [Validators.maxLength(255)]),
    metaDescription: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
  });

  constructor() {
    const c = this.data.category;
    if (c) {
      this.form.patchValue({
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        description: c.description ?? '',
        imageAlt: c.imageAlt ?? '',
        active: c.status === 'active',
        metaTitle: c.metaTitle ?? '',
        metaDescription: c.metaDescription ?? '',
      });
      if (c.imageAssetId && c.imageUrl) {
        this.selectedAsset.set({ id: c.imageAssetId, url: c.imageUrl });
      }
    }

    // Slug automático desde el nombre mientras no esté bloqueado.
    this.form.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (!this.slugLocked()) {
        this.form.controls.slug.setValue(slugify(name), { emitEvent: false });
      }
    });
  }

  toggleSlugLock(): void {
    this.slugLocked.set(!this.slugLocked());
  }

  onSlugInput(): void {
    this.slugLocked.set(true);
  }

  // ----------------------------- imagen -----------------------------

  /** Abre el selector de la biblioteca (una sola imagen). */
  openLibrary(): void {
    this.dialog
      .open(MediaPickerDialogComponent, {
        autoFocus: false,
        data: { multiple: false } satisfies MediaPickerData,
      })
      .afterClosed()
      .subscribe((selected?: MediaAsset[]) => {
        const asset = selected?.[0];
        if (asset) {
          // Sustituye la selección; la elegida de biblioteca no es efímera.
          this.discardSessionUploadIfAny();
          this.selectedAsset.set({ id: asset.id, url: asset.url });
        }
      });
  }

  /** Sube una imagen directamente y la asigna como imagen de la categoría. */
  onImageSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.uploadingImage.set(true);
    this.mediaService.upload([file]).subscribe({
      next: (created) => {
        this.uploadingImage.set(false);
        const asset = created[0];
        if (asset) {
          // Descarta una subida previa de la sesión que estuviera reemplazándose.
          this.discardSessionUploadIfAny();
          this.selectedAsset.set({ id: asset.id, url: asset.url });
          this.uploadedThisSession = asset.id;
        }
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudo subir la imagen'));
      },
    });
  }

  removeImage(): void {
    this.discardSessionUploadIfAny();
    this.selectedAsset.set(null);
    this.form.controls.imageAlt.setValue('');
  }

  /** Si la imagen actual era una subida no guardada de la sesión, bórrala del servidor. */
  private discardSessionUploadIfAny(): void {
    if (this.uploadedThisSession) {
      const id = this.uploadedThisSession;
      this.uploadedThisSession = null;
      this.mediaService.remove(id).subscribe({ error: () => undefined });
    }
  }

  /** Al cerrar el diálogo sin guardar, limpia la subida efímera no asociada. */
  ngOnDestroy(): void {
    if (!this.saved) {
      this.discardSessionUploadIfAny();
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (this.selectedAsset() && !v.imageAlt) {
      this.form.controls.imageAlt.setErrors({ required: true });
      this.form.controls.imageAlt.markAsTouched();
      return;
    }

    const payload: CategoryPayload = {
      name: v.name,
      slug: v.slug,
      parentId: v.parentId || null,
      description: v.description || null,
      imageAssetId: this.selectedAsset()?.id ?? null,
      imageAlt: this.selectedAsset() ? v.imageAlt || null : null,
      status: v.active ? 'active' : 'inactive',
      metaTitle: v.metaTitle || null,
      metaDescription: v.metaDescription || null,
    };

    this.saving.set(true);
    const request = this.isEdit
      ? this.categoriesService.update(this.data.category!.id, payload)
      : this.categoriesService.create(payload);

    request.subscribe({
      next: () => {
        // La imagen quedó asociada: ya no es una subida efímera a limpiar.
        this.saved = true;
        this.uploadedThisSession = null;
        this.notify.success(this.isEdit ? 'Categoría actualizada' : 'Categoría creada');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(getApiErrorMessage(err));
      },
    });
  }

  /** Opciones de padre: todas menos la propia categoría y sus descendientes. */
  private computeParentOptions(): Category[] {
    const all = this.data.all;
    const self = this.data.category;
    if (!self) {
      return all;
    }
    const childrenOf = new Map<string, string[]>();
    for (const cat of all) {
      if (cat.parentId) {
        const arr = childrenOf.get(cat.parentId) ?? [];
        arr.push(cat.id);
        childrenOf.set(cat.parentId, arr);
      }
    }
    const blocked = new Set<string>([self.id]);
    const stack = [...(childrenOf.get(self.id) ?? [])];
    while (stack.length) {
      const node = stack.pop()!;
      if (!blocked.has(node)) {
        blocked.add(node);
        stack.push(...(childrenOf.get(node) ?? []));
      }
    }
    return all.filter((cat) => !blocked.has(cat.id));
  }
}
