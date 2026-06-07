import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Category } from '@models/category.models';
import { PRODUCT_STATUSES, ProductListItem, ProductStatus } from '@models/product.models';
import { CategoriesService } from '@services/categories.service';
import { NotificationService } from '@services/notification.service';
import { ProductsService } from '@services/products.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import {
  DataTableCellDirective,
  DataTableColumn,
  DataTableComponent,
} from '@shared/components/data-table/data-table.component';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, DataTableComponent, DataTableCellDirective, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly items = signal<ProductListItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  readonly categories = signal<Category[]>([]);
  readonly statuses = PRODUCT_STATUSES;

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly statusFilter = signal<ProductStatus[]>([]);
  readonly categoryFilter = signal<string | null>(null);
  readonly featuredOnly = signal(false);

  readonly columns: DataTableColumn<ProductListItem>[] = [
    { key: 'cover', header: '', width: '64px' },
    { key: 'name', header: 'Producto' },
    { key: 'sku', header: 'SKU', cell: (p) => p.sku ?? '—' },
    {
      key: 'price',
      header: 'Precio',
      cell: (p) => (p.price != null ? this.formatPrice(p.price) : '—'),
      align: 'end',
      width: '110px',
    },
    { key: 'stock', header: 'Stock', cell: (p) => p.stock, align: 'center', width: '90px' },
    { key: 'categories', header: 'Categorías' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', align: 'end', width: '52px' },
  ];

  constructor() {
    this.load();
    this.categoriesService.flat().subscribe({
      next: (c) => this.categories.set(c),
      error: () => undefined,
    });
    this.searchCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.load();
      });
  }

  load(): void {
    this.loading.set(true);
    this.productsService
      .list({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        search: this.searchCtrl.value || undefined,
        status: this.statusFilter().length ? this.statusFilter() : undefined,
        categoryId: this.categoryFilter() ?? undefined,
        featured: this.featuredOnly() ? true : undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notify.error(getApiErrorMessage(err, 'No se pudieron cargar los productos'));
        },
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  onStatusChange(value: ProductStatus[]): void {
    this.statusFilter.set(value);
    this.resetAndLoad();
  }

  onCategoryChange(value: string | null): void {
    this.categoryFilter.set(value);
    this.resetAndLoad();
  }

  onFeaturedChange(value: boolean): void {
    this.featuredOnly.set(value);
    this.resetAndLoad();
  }

  newProduct(): void {
    this.router.navigate(['/panel/products/new']);
  }

  edit(product: ProductListItem): void {
    this.router.navigate(['/panel/products', product.id, 'edit']);
  }

  duplicate(product: ProductListItem): void {
    this.productsService.duplicate(product.id).subscribe({
      next: () => {
        this.notify.success('Producto duplicado');
        this.load();
      },
      error: (err) => this.notify.error(getApiErrorMessage(err)),
    });
  }

  remove(product: ProductListItem): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar producto',
          message: `¿Seguro que quieres eliminar "${product.name}"?`,
          confirmText: 'Eliminar',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) {
          return;
        }
        this.productsService.remove(product.id).subscribe({
          next: () => {
            this.notify.success('Producto eliminado');
            this.load();
          },
          error: (err) => this.notify.error(getApiErrorMessage(err)),
        });
      });
  }

  statusLabel(status: ProductStatus): string {
    return status === 'active' ? 'Activo' : status === 'draft' ? 'Borrador' : 'Archivado';
  }

  formatPrice(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  private resetAndLoad(): void {
    this.pageIndex.set(0);
    this.load();
  }
}
