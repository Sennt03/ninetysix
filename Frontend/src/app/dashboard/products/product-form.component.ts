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

interface ComboPart {
  optionType: string;
  value: string;
}

interface VariantRow {
  key: string;
  combo: ComboPart[];
  price: number | null;
  comparePrice: number | null;
  sku: string;
  stock: number;
  color: string;
  /** Asset de la imagen a la que salta la galería de la tienda ('' = ninguna). */
  imageAssetId: string;
  active: boolean;
  isDefault: boolean;
}

/**
 * Fila previa candidata a "donar" su configuración a una fila nueva.
 * `differing` son las dimensiones cuyo valor cambia respecto de la donante
 * (vacío = es exactamente la misma variante y se reutiliza tal cual).
 */
interface Donor {
  row: VariantRow;
  differing: { optionType: string; value: string; prevValue?: string }[];
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

  /**
   * Check «Copiar configuración a las variantes nuevas» (desmarcado por
   * defecto). Al añadir valores a una opción que ya existía (otro color, otra
   * talla…), copia los datos de la variante más parecida en vez de dejar las
   * filas nuevas vacías. Ver `findDonor`.
   */
  readonly keepConfig = signal(false);

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

  /** Asocia la variante a una de las imágenes del producto ('' = ninguna). */
  setRowImage(key: string, assetId: string): void {
    this.variantRows.update((rows) =>
      rows.map((r) => (r.key === key ? { ...r, imageAssetId: assetId } : r)),
    );
  }

  /** Imagen asociada a la fila, para la miniatura de la tabla. */
  rowImage(row: VariantRow): ProductImageItem | null {
    return this.images().find((i) => i.assetId === row.imageAssetId) ?? null;
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

  /**
   * Recalcula la tabla de variantes conservando lo ya configurado.
   *
   * Cada combinación nueva busca una fila "donante" entre las anteriores:
   *   1. La misma variante (aunque se haya renombrado la opción) → se reutiliza.
   *   2. Una fila que coincide en TODAS las dimensiones que ya existían: es lo
   *      que pasa al añadir una opción nueva (S → S-Rojo hereda de S) o al
   *      quitarla (S-Rojo → S). Este es el comportamiento por defecto.
   *   3. Con «Copiar configuración a las variantes nuevas» activo, además la
   *      fila más parecida: así S-Azul copia lo de S-Rojo en vez de nacer vacía.
   * El SKU nunca se duplica (es único en BD): si la variante no es la misma, se
   * deriva uno nuevo a partir del de la donante.
   */
  private regenerateVariants(): void {
    const types = this.optionTypes().filter((t) => t.values.length > 0);
    const combos = this.cartesian(types);
    const prevRows = this.variantRows();
    const mapType = this.buildTypeMapper(prevRows, types);

    const pendingSkus: { index: number; base: string }[] = [];
    let rows: VariantRow[] = combos.map((combo, i) => {
      const key = this.comboKey(combo);
      const donor = this.findDonor(combo, prevRows, mapType);
      if (!donor) {
        return this.blankRow(key, combo);
      }
      const row: VariantRow = { ...donor.row, key, combo };
      if (donor.differing.length === 0) {
        return row; // misma variante: se conserva todo (incluido el SKU)
      }
      const base = this.deriveSku(donor.row.sku, donor.differing);
      if (base) {
        pendingSkus.push({ index: i, base });
      }
      return { ...row, sku: '', isDefault: false };
    });

    // Los SKU derivados se asignan al final para no chocar con los que se
    // conservan tal cual (el SKU es único en la base de datos).
    if (pendingSkus.length) {
      const used = new Set(rows.map((r) => r.sku.trim().toUpperCase()).filter(Boolean));
      for (const { index, base } of pendingSkus) {
        let candidate = base;
        let n = 2;
        while (used.has(candidate.toUpperCase())) {
          candidate = `${base}-${n++}`;
        }
        used.add(candidate.toUpperCase());
        rows[index] = { ...rows[index], sku: candidate };
      }
    }

    if (rows.length > 0 && !rows.some((r) => r.isDefault)) {
      rows = rows.map((r, i) => ({ ...r, isDefault: i === 0 }));
    }
    this.variantRows.set(rows);
  }

  private blankRow(key: string, combo: ComboPart[]): VariantRow {
    return {
      key,
      combo,
      price: null,
      comparePrice: null,
      sku: '',
      stock: 0,
      color: '',
      imageAssetId: '',
      active: true,
      isDefault: false,
    };
  }

  /**
   * Traduce el nombre de una opción actual al que tenía en las filas previas.
   * Por nombre si sigue existiendo y, si no, por posición: así renombrar
   * "Talla" → "Tallas" (letra a letra, mientras se escribe) no borra la tabla.
   */
  private buildTypeMapper(
    prevRows: VariantRow[],
    types: EditableOptionType[],
  ): (name: string) => string {
    const prevNames: string[] = [];
    for (const row of prevRows) {
      for (const part of row.combo) {
        if (!prevNames.includes(part.optionType)) {
          prevNames.push(part.optionType);
        }
      }
    }
    const newNames = types.map((t) => this.typeName(t));
    const sameShape = prevNames.length === newNames.length;
    return (name: string) => {
      if (prevNames.includes(name)) {
        return name;
      }
      const i = newNames.indexOf(name);
      return sameShape && i >= 0 ? prevNames[i] : name;
    };
  }

  private findDonor(
    combo: ComboPart[],
    prevRows: VariantRow[],
    mapType: (name: string) => string,
  ): Donor | null {
    let projection: { row: VariantRow; known: number } | null = null;
    let partial: { row: VariantRow; matched: number } | null = null;

    for (const row of prevRows) {
      const dims = combo.map((c) => ({
        part: c,
        prevValue: row.combo.find((p) => p.optionType === mapType(c.optionType))?.value,
      }));
      const known = dims.filter((d) => d.prevValue !== undefined);
      const matched = known.filter((d) => d.prevValue === d.part.value).length;

      // Coincide en todo lo que esa fila podía decir: donante directa.
      if (known.length > 0 && matched === known.length) {
        if (!projection || known.length > projection.known) {
          projection = { row, known: known.length };
        }
      } else if (matched > 0 && (!partial || matched > partial.matched)) {
        partial = { row, matched };
      }
    }

    const chosen = projection?.row ?? (this.keepConfig() ? partial?.row : null);
    if (!chosen) {
      return null;
    }
    const differing = combo
      .map((c) => ({
        optionType: c.optionType,
        value: c.value,
        prevValue: chosen.combo.find((p) => p.optionType === mapType(c.optionType))?.value,
      }))
      .filter((d) => d.prevValue !== d.value);
    return { row: chosen, differing };
  }

  /**
   * SKU para una variante que hereda de otra. Sustituye en el SKU de la donante
   * el trozo del valor que cambia (CAM-S-ROJO → CAM-S-AZUL) y, si no aparece,
   * lo añade al final. Sin SKU de origen no inventa nada.
   */
  private deriveSku(
    donorSku: string,
    differing: { value: string; prevValue?: string }[],
  ): string {
    let sku = donorSku.trim();
    if (!sku) {
      return '';
    }
    for (const d of differing) {
      const next = this.skuToken(d.value);
      if (!next) {
        continue;
      }
      const prev = d.prevValue ? this.skuToken(d.prevValue) : '';
      const at = prev ? sku.toUpperCase().indexOf(prev) : -1;
      sku = at >= 0 ? sku.slice(0, at) + next + sku.slice(at + prev.length) : `${sku}-${next}`;
    }
    return sku.slice(0, 100);
  }

  private skuToken(value: string): string {
    return slugify(value).replace(/-/g, '').toUpperCase();
  }

  /**
   * Nombre canónico de una opción: SIEMPRE trimeado. Es el que viaja dentro del
   * `combo` de cada variante y debe casar carácter a carácter con el `name` que
   * `buildPayload` envía en `optionTypes`, porque el backend enlaza
   * variante↔valor por ese nombre. Si no casan (p. ej. "colores " con un espacio
   * al final), el enlace se pierde y en la tienda el selector sale bloqueado.
   */
  private typeName(type: EditableOptionType): string {
    return type.name.trim() || 'Opción';
  }

  private cartesian(types: EditableOptionType[]): ComboPart[][] {
    if (types.length === 0) {
      return [];
    }
    return types.reduce<ComboPart[][]>(
      (acc, type) => {
        const next: ComboPart[][] = [];
        for (const combo of acc) {
          for (const value of type.values) {
            next.push([...combo, { optionType: this.typeName(type), value }]);
          }
        }
        return next;
      },
      [[]],
    );
  }

  /** Clave estable de una combinación (identidad de la fila en la tabla). */
  private comboKey(combo: ComboPart[]): string {
    return combo.map((c) => `${c.optionType}=${c.value}`).join('|');
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
    // Las variantes que apuntaban a esa imagen se quedan sin destino.
    this.variantRows.update((rows) =>
      rows.map((r) => (r.imageAssetId === assetId ? { ...r, imageAssetId: '' } : r)),
    );
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
      // Una opción con valores pero sin nombre generaría combinaciones que el
      // backend no sabría enlazar: se avisa aquí en vez de guardar a medias.
      if (this.optionTypes().some((t) => !t.name.trim() && t.values.length)) {
        this.notify.error('Hay una opción con valores pero sin nombre: ponle un nombre.');
        return null;
      }
      optionTypes = types.map((t, i) => ({ name: t.name.trim(), values: t.values, sortOrder: i }));
      const skus = this.variantRows()
        .map((r) => r.sku.trim().toUpperCase())
        .filter(Boolean);
      if (new Set(skus).size !== skus.length) {
        this.notify.error('Hay SKU repetidos entre las variantes: deben ser únicos.');
        return null;
      }
      variants = this.variantRows().map((r, i) => ({
        sku: r.sku.trim() || undefined,
        price: r.price ?? 0,
        comparePrice: r.comparePrice ?? undefined,
        stock: r.stock,
        stockPolicy: 'allow' as StockPolicy,
        color: r.color || undefined,
        imageAssetId: r.imageAssetId || undefined,
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
        // El orden de las dimensiones debe seguir al de las opciones del
        // producto: es el mismo que produce `cartesian` al regenerar.
        const combo = types
          .map((t) => v.options.find((o) => o.optionType === t.name))
          .filter((o): o is NonNullable<typeof o> => !!o)
          .map((o) => ({ optionType: o.optionType, value: o.value }));
        return {
          key: this.comboKey(combo),
          combo,
          price: v.price,
          comparePrice: v.comparePrice,
          sku: v.sku ?? '',
          stock: v.stock,
          color: v.color ?? '',
          imageAssetId: v.imageAssetId ?? '',
          active: v.active,
          isDefault: v.isDefault,
        };
      });
      this.variantRows.set(rows);
    }
  }
}
