import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReorderItem } from '@models/api.models';
import { Category } from '@models/category.models';
import { CategoriesService } from '@services/categories.service';
import { NotificationService } from '@services/notification.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import {
  DataTableCellDirective,
  DataTableColumn,
  DataTableComponent,
} from '@shared/components/data-table/data-table.component';
import { materialImports } from '@shared/material/material.imports';
import { getApiErrorMessage } from '@shared/utils/http-error';
import { CategoryFormDialogComponent } from './category-form-dialog.component';

@Component({
  selector: 'app-categories',
  imports: [DataTableComponent, DataTableCellDirective, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly rows = signal<Category[]>([]);
  readonly loading = signal(false);

  readonly columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Categoría' },
    { key: 'parentName', header: 'Padre', cell: (c) => c.parentName ?? '—' },
    {
      key: 'productCount',
      header: 'Productos',
      cell: (c) => c.productCount,
      align: 'center',
      width: '110px',
    },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'reorder', header: 'Orden', align: 'center', width: '76px' },
    { key: 'actions', header: '', align: 'end', width: '52px' },
  ];

  readonly sortedRows = computed(() => [...this.rows()].sort((a, b) => a.sortOrder - b.sortOrder));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.categoriesService.flat().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(getApiErrorMessage(err, 'No se pudieron cargar las categorías'));
      },
    });
  }

  create(): void {
    this.openForm(null);
  }

  edit(category: Category): void {
    this.openForm(category);
  }

  remove(category: Category): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar categoría',
          message: `¿Eliminar "${category.name}"? Sus subcategorías quedarán sin padre y se desvincularán sus productos.`,
          confirmText: 'Eliminar',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed?: boolean) => {
        if (!confirmed) {
          return;
        }
        this.categoriesService.remove(category.id).subscribe({
          next: () => {
            this.notify.success('Categoría eliminada');
            this.load();
          },
          error: (err) => this.notify.error(getApiErrorMessage(err)),
        });
      });
  }

  isFirst(c: Category): boolean {
    return this.sortedRows()[0]?.id === c.id;
  }

  isLast(c: Category): boolean {
    return this.sortedRows().at(-1)?.id === c.id;
  }

  moveUp(c: Category): void {
    this.move(c, -1);
  }

  moveDown(c: Category): void {
    this.move(c, 1);
  }

  /**
   * Mueve la categoría una posición y reasigna `sortOrder` secuencial a toda
   * la lista. Reasignar (en vez de intercambiar valores) es robusto aunque
   * todas las categorías compartan el mismo sortOrder inicial (p. ej. 0).
   */
  private move(c: Category, dir: -1 | 1): void {
    const sorted = this.sortedRows();
    const idx = sorted.findIndex((r) => r.id === c.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) {
      return;
    }
    const reordered = [...sorted];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const withOrder = reordered.map((r, i) => ({ ...r, sortOrder: i }));
    this.rows.set(withOrder);
    this.saveReorder(withOrder.map((r) => ({ id: r.id, sortOrder: r.sortOrder })));
  }

  private saveReorder(items: ReorderItem[]): void {
    this.categoriesService.reorder(items).subscribe({
      error: () => {
        this.notify.error('No se pudo guardar el orden');
        this.load();
      },
    });
  }

  private openForm(category: Category | null): void {
    this.dialog
      .open(CategoryFormDialogComponent, {
        width: '580px',
        maxWidth: '95vw',
        data: { category, all: this.rows() },
      })
      .afterClosed()
      .subscribe((saved?: boolean) => {
        if (saved) {
          this.load();
        }
      });
  }
}
