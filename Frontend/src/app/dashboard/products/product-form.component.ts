import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '@models/category.models';
import { MediaAsset } from '@models/media.models';
import {
  OptionTypeInput,
  ProductDetail,
  ProductImageInput,
  ProductPayload,
  ProductStatus,
  PRODUCT_STATUSES,
  StockPolicy,
  VariantInput,
} from '@models/product.models';
import { CategoriesService } from '@services/categories.service';
import { MediaService } from '@services/media.service';
import { NotificationService } from '@services/notification.service';
import { ProductsService } from '@services/products.service';
import {
  MediaPickerData,
  MediaPickerDialogComponent,
} from '../media/media-picker-dialog.component';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { slugify } from '@shared/utils/slug';

interface EditableOptionType {
  name: string;
  values: string[];
}

/** Imagen seleccionada en el formulario (la primera de la lista es la portada). */
interface ProductImageItem {
  assetId: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string;
}

const MAX_IMAGES = 20;

interface VariantRow {
  key: string;
  combo: { optionType: string; value: string }[];
  price: number | null;
  comparePrice: number | null;
  sku: string;
  stock: number;
  color: string;
  active: boolean;
  isDefault: boolean;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requireAtLeastOne(ctrl: AbstractControl): ValidationErrors | null {
  const val = ctrl.value as unknown[];
  return Array.isArray(val) && val.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly mediaService = inject(MediaService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly statuses = PRODUCT_STATUSES;
  readonly categories = signal<Category[]>([]);
  readonly images = signal<ProductImageItem[]>([]);
  readonly uploadingImages = signal(false);
  readonly maxImages = MAX_IMAGES;

  /**
   * Imágenes subidas con el botón "Subir" en esta sesión de edición y aún no
   * guardadas. Si se quitan o se sale sin guardar, se borran del servidor para
   * no dejar archivos huérfanos. Las elegidas desde la biblioteca NO entran aquí.
   */
  private readonly sessionUploads = new Set<string>();
  private saved = false;

  readonly editId = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly slugLocked = signal(false);

  readonly hasVariants = signal(false);
  readonly optionTypes = signal<EditableOptionType[]>([]);
  readonly variantRows = signal<VariantRow[]>([]);

  readonly generalForm = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    slug: this.fb.nonNullable.control('', [Validators.pattern(SLUG_PATTERN)]),
    description: this.fb.nonNullable.control(''),
    shortDescription: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
    status: this.fb.nonNullable.control<ProductStatus>('active'),
    featured: this.fb.nonNullable.control(false),
    categoryIds: this.fb.nonNullable.control<string[]>([], [requireAtLeastOne]),
    metaTitle: this.fb.nonNullable.control('', [Validators.maxLength(255)]),
    metaDescription: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
  });

  readonly simpleForm = this.fb.group({
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    comparePrice: this.fb.control<number | null>(null, [Validators.min(0)]),
    costPrice: this.fb.control<number | null>(null, [Validators.min(0)]),
    sku: this.fb.nonNullable.control(''),
    stock: this.fb.nonNullable.control(0, [Validators.min(0)]),
    stockPolicy: this.fb.nonNullable.control<StockPolicy>('allow'),
    weight: this.fb.control<number | null>(null, [Validators.min(0)]),
  });

  constructor() {
    this.categoriesService.flat().subscribe({
      next: (c) => this.categories.set(c),
      error: () => undefined,
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.isEdit.set(true);
      this.slugLocked.set(true);
      this.loadProduct(id);
    }

    this.generalForm.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (!this.slugLocked()) {
        this.generalForm.controls.slug.setValue(slugify(name), { emitEvent: false });
      }
    });
  }

  onSlugInput(): void {
    this.slugLocked.set(true);
  }

  toggleVariants(enabled: boolean): void {
    this.hasVariants.set(enabled);
    if (enabled && this.optionTypes().length === 0) {
      this.addOptionType();
    }
  }

  // ----------------------------- opciones -----------------------------

  addOptionType(): void {
    if (this.optionTypes().length >= 3) {
      return;
    }
    this.optionTypes.update((types) => [...types, { name: '', values: [] }]);
  }

  removeOptionType(index: number): void {
    this.optionTypes.update((types) => types.filter((_, i) => i !== index));
    this.regenerateVariants();
  }

  setOptionName(index: number, name: string): void {
    this.optionTypes.update((types) =>
      types.map((t, i) => (i === index ? { ...t, name } : t)),
    );
    this.regenerateVariants();
  }

  addValue(index: number, input: HTMLInputElement): void {
    const value = input.value.trim();
    input.value = '';
    if (!value) {
      return;
    }
    this.optionTypes.update((types) =>
      types.map((t, i) =>
        i === index && !t.values.includes(value) ? { ...t, values: [...t.values, value] } : t,
      ),
    );
    this.regenerateVariants();
  }

  removeValue(index: number, value: string): void {
    this.optionTypes.update((types) =>
      types.map((t, i) => (i === index ? { ...t, values: t.values.filter((v) => v !== value) } : t)),
    );
    this.regenerateVariants();
  }

  // ----------------------------- variantes -----------------------------

  updateRow(key: string, field: 'price' | 'comparePrice' | 'sku' | 'stock' | 'color', event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.variantRows.update((rows) =>
      rows.map((r) => {
        if (r.key !== key) {
          return r;
        }
        if (field === 'sku' || field === 'color') {
          return { ...r, [field]: raw };
        }
        if (field === 'stock') {
          return { ...r, stock: raw === '' ? 0 : Number(raw) };
        }
        return { ...r, [field]: raw === '' ? null : Number(raw) };
      }),
    );
  }

  clearColor(key: string): void {
    this.variantRows.update((rows) => rows.map((r) => (r.key === key ? { ...r, color: '' } : r)));
  }

  toggleRowActive(key: string): void {
    this.variantRows.update((rows) =>
      rows.map((r) => (r.key === key ? { ...r, active: !r.active } : r)),
    );
  }

  setRowDefault(key: string): void {
    this.variantRows.update((rows) => rows.map((r) => ({ ...r, isDefault: r.key === key })));
  }

  applyPriceToAll(input: HTMLInputElement): void {
    const value = input.value === '' ? null : Number(input.value);
    if (value === null) {
      return;
    }
    this.variantRows.update((rows) =>
      rows.map((r) => (r.price == null ? { ...r, price: value } : r)),
    );
  }

  private regenerateVariants(): void {
    const types = this.optionTypes().filter((t) => t.values.length > 0);
    const combos = this.cartesian(types);
    const existing = new Map(this.variantRows().map((r) => [r.key, r]));

    let rows: VariantRow[] = combos.map((combo) => {
      const key = this.comboKey(combo, types);
      const prev = existing.get(key);
      return (
        prev ?? {
          key,
          combo,
          price: null,
          comparePrice: null,
          sku: '',
          stock: 0,
          color: '',
          active: true,
          isDefault: false,
        }
      );
    });

    if (rows.length > 0 && !rows.some((r) => r.isDefault)) {
      rows = rows.map((r, i) => ({ ...r, isDefault: i === 0 }));
    }
    this.variantRows.set(rows);
  }

  private cartesian(
    types: EditableOptionType[],
  ): { optionType: string; value: string }[][] {
    if (types.length === 0) {
      return [];
    }
    return types.reduce<{ optionType: string; value: string }[][]>(
      (acc, type) => {
        const next: { optionType: string; value: string }[][] = [];
        for (const combo of acc) {
          for (const value of type.values) {
            next.push([...combo, { optionType: type.name || 'Opción', value }]);
          }
        }
        return next;
      },
      [[]],
    );
  }

  private comboKey(
    combo: { optionType: string; value: string }[],
    types: EditableOptionType[],
  ): string {
    return types
      .map((t) => combo.find((c) => c.optionType === (t.name || 'Opción'))?.value ?? '')
      .join('|');
  }

  // ----------------------------- guardar -----------------------------

  save(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }
    this.saving.set(true);
    const request = this.isEdit()
      ? this.productsService.update(this.editId()!, payload)
      : this.productsService.create(payload);

    request.subscribe({
      next: () => {
        // Las subidas de la sesión quedaron asociadas: ya no son huérfanas.
        this.saved = true;
        this.sessionUploads.clear();
        this.notify.success(this.isEdit() ? 'Producto actualizado' : 'Producto creado');
        this.router.navigate(['/panel/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(getApiErrorMessage(err));
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/panel/products']);
  }

  /** Al salir sin guardar, elimina del servidor las subidas no asociadas de la sesión. */
  ngOnDestroy(): void {
    if (this.saved) {
      return;
    }
    for (const id of this.sessionUploads) {
      this.mediaService.remove(id).subscribe({ error: () => undefined });
    }
    this.sessionUploads.clear();
  }

  statusLabel(status: ProductStatus): string {
    return status === 'active' ? 'Activo' : status === 'draft' ? 'Borrador' : 'Archivado';
  }

  comboLabel(row: VariantRow): string {
    return row.combo.map((c) => c.value).join(' · ');
  }

  // ----------------------------- imágenes -----------------------------

  /** Abre el selector de la biblioteca (múltiple) y añade lo elegido sin duplicar. */
  openLibrary(): void {
    this.dialog
      .open(MediaPickerDialogComponent, {
        autoFocus: false,
        data: { multiple: true, excludeIds: this.images().map((i) => i.assetId) } satisfies MediaPickerData,
      })
      .afterClosed()
      .subscribe((selected?: MediaAsset[]) => {
        if (selected?.length) {
          this.addAssets(selected);
        }
      });
  }

  /** Sube archivos directamente desde el formulario (van a la biblioteca y se añaden). */
  onImagesSelected(input: HTMLInputElement): void {
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) {
      return;
    }
    if (this.images().length + files.length > MAX_IMAGES) {
      this.notify.error(`Máximo ${MAX_IMAGES} imágenes por producto.`);
      return;
    }
    this.uploadingImages.set(true);
    this.mediaService.upload(files).subscribe({
      next: (created) => {
        this.uploadingImages.set(false);
        // Marca estas subidas como efímeras de la sesión (candidatas a limpieza).
        created.forEach((a) => this.sessionUploads.add(a.id));
        this.addAssets(created);
      },
      error: (err) => {
        this.uploadingImages.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudieron subir las imágenes'));
      },
    });
  }

  private addAssets(assets: MediaAsset[]): void {
    this.images.update((list) => {
      const existing = new Set(list.map((i) => i.assetId));
      const additions = assets
        .filter((a) => !existing.has(a.id))
        .map((a) => ({ assetId: a.id, url: a.url, thumbnailUrl: a.thumbnailUrl, altText: '' }));
      const merged = [...list, ...additions];
      if (merged.length > MAX_IMAGES) {
        this.notify.error(`Máximo ${MAX_IMAGES} imágenes por producto.`);
        return merged.slice(0, MAX_IMAGES);
      }
      return merged;
    });
  }

  removeImage(assetId: string): void {
    this.images.update((list) => list.filter((i) => i.assetId !== assetId));
    // Si era una subida no guardada de esta sesión, bórrala del servidor ya.
    if (this.sessionUploads.has(assetId)) {
      this.sessionUploads.delete(assetId);
      this.mediaService.remove(assetId).subscribe({ error: () => undefined });
    }
  }

  /** Marca como portada moviéndola a la primera posición. */
  makeCover(assetId: string): void {
    this.images.update((list) => {
      const idx = list.findIndex((i) => i.assetId === assetId);
      if (idx <= 0) {
        return list;
      }
      const next = [...list];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  }

  moveImage(assetId: string, dir: -1 | 1): void {
    this.images.update((list) => {
      const idx = list.findIndex((i) => i.assetId === assetId);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= list.length) {
        return list;
      }
      const next = [...list];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  setImageAlt(assetId: string, value: string): void {
    this.images.update((list) =>
      list.map((i) => (i.assetId === assetId ? { ...i, altText: value } : i)),
    );
  }

  private buildPayload(): ProductPayload | null {
    if (this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      this.notify.error('Revisa los datos generales del producto.');
      return null;
    }
    const g = this.generalForm.getRawValue();

    let variants: VariantInput[] = [];
    let optionTypes: OptionTypeInput[] | undefined;

    if (!this.hasVariants()) {
      if (this.simpleForm.invalid) {
        this.simpleForm.markAllAsTouched();
        this.notify.error('Revisa el precio y el stock.');
        return null;
      }
      const s = this.simpleForm.getRawValue();
      variants = [
        {
          sku: s.sku || undefined,
          price: s.price ?? 0,
          comparePrice: s.comparePrice ?? undefined,
          costPrice: s.costPrice ?? undefined,
          stock: s.stock,
          stockPolicy: s.stockPolicy,
          weight: s.weight ?? undefined,
          isDefault: true,
          active: true,
          sortOrder: 0,
        },
      ];
    } else {
      const types = this.optionTypes().filter((t) => t.name.trim() && t.values.length);
      if (types.length === 0 || this.variantRows().length === 0) {
        this.notify.error('Define al menos una opción con sus valores.');
        return null;
      }
      optionTypes = types.map((t, i) => ({ name: t.name.trim(), values: t.values, sortOrder: i }));
      variants = this.variantRows().map((r, i) => ({
        sku: r.sku || undefined,
        price: r.price ?? 0,
        comparePrice: r.comparePrice ?? undefined,
        stock: r.stock,
        stockPolicy: 'allow' as StockPolicy,
        color: r.color || undefined,
        isDefault: r.isDefault,
        active: r.active,
        sortOrder: i,
        options: r.combo,
      }));
    }

    const images: ProductImageInput[] = this.images().map((img, i) => ({
      assetId: img.assetId,
      altText: img.altText.trim() || undefined,
      sortOrder: i,
      isCover: i === 0,
    }));

    return {
      name: g.name,
      slug: g.slug || undefined,
      description: g.description || undefined,
      shortDescription: g.shortDescription || undefined,
      status: g.status,
      hasVariants: this.hasVariants(),
      featured: g.featured,
      categoryIds: g.categoryIds,
      metaTitle: g.metaTitle || undefined,
      metaDescription: g.metaDescription || undefined,
      optionTypes,
      images,
      variants,
    };
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.get(id).subscribe({
      next: (p) => {
        this.patchFromDetail(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudo cargar el producto'));
        this.router.navigate(['/panel/products']);
      },
    });
  }

  private patchFromDetail(p: ProductDetail): void {
    this.generalForm.patchValue({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      shortDescription: p.shortDescription ?? '',
      status: p.status,
      featured: p.featured,
      categoryIds: p.categories.map((c) => c.id),
      metaTitle: p.metaTitle ?? '',
      metaDescription: p.metaDescription ?? '',
    });
    this.hasVariants.set(p.hasVariants);

    // Imágenes: ya vienen ordenadas (portada primera) desde el backend.
    this.images.set(
      p.images.map((img) => ({
        assetId: img.assetId,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        altText: img.altText ?? '',
      })),
    );

    if (!p.hasVariants) {
      const v = p.variants[0];
      if (v) {
        this.simpleForm.patchValue({
          price: v.price,
          comparePrice: v.comparePrice,
          costPrice: v.costPrice,
          sku: v.sku ?? '',
          stock: v.stock,
          stockPolicy: v.stockPolicy,
          weight: v.weight,
        });
      }
    } else {
      const types: EditableOptionType[] = p.optionTypes.map((ot) => ({
        name: ot.name,
        values: ot.values.map((val) => val.value),
      }));
      this.optionTypes.set(types);
      const rows: VariantRow[] = p.variants.map((v) => {
        const combo = v.options.map((o) => ({ optionType: o.optionType, value: o.value }));
        return {
          key: this.comboKey(combo, types),
          combo,
          price: v.price,
          comparePrice: v.comparePrice,
          sku: v.sku ?? '',
          stock: v.stock,
          color: v.color ?? '',
          active: v.active,
          isDefault: v.isDefault,
        };
      });
      this.variantRows.set(rows);
    }
  }
}
