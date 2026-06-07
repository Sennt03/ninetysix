import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

/** Definición de una columna de la tabla genérica. */
export interface DataTableColumn<T> {
  /** Identificador único de la columna. */
  key: string;
  /** Texto de la cabecera. */
  header: string;
  /** Devuelve el texto de la celda (para columnas simples). */
  cell?: (row: T) => string | number | null | undefined;
  /** Alineación del contenido. */
  align?: 'start' | 'center' | 'end';
  /** Ancho fijo opcional (p. ej. '120px'). */
  width?: string;
}

/**
 * Plantilla de celda personalizada para una columna concreta.
 * Uso: `<ng-template appDataTableCell="roles" let-row> ... </ng-template>`.
 * Si una columna tiene plantilla, se usa en lugar de `column.cell`.
 */
@Directive({ selector: 'ng-template[appDataTableCell]' })
export class DataTableCellDirective {
  readonly columnKey = input.required<string>({ alias: 'appDataTableCell' });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Tabla genérica reutilizable con paginación del lado del servidor.
 *
 * - Columnas declarativas (`columns`), con celda por función o por plantilla.
 * - Paginación servidor: emite `(page)`; el contenedor recarga los datos.
 * - Barra de carga y estado vacío incluidos.
 *
 * Pensada como base para el listado de cualquier módulo (usuarios, productos…).
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, MatTableModule, MatPaginatorModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dt">
      <div class="dt__bar">
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        }
      </div>

      <div class="dt__scroll">
        <table mat-table [dataSource]="data()" class="dt__table">
          @for (col of columns(); track col.key) {
            <ng-container [matColumnDef]="col.key">
              <th
                mat-header-cell
                *matHeaderCellDef
                [style.text-align]="col.align ?? 'start'"
                [style.width]="col.width"
              >
                {{ col.header }}
              </th>
              <td mat-cell *matCellDef="let row" [style.text-align]="col.align ?? 'start'">
                @if (templateMap().get(col.key); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{ $implicit: row }"
                  />
                } @else {
                  {{ col.cell ? col.cell(row) : '' }}
                }
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="columnKeys()"></tr>
          <tr mat-row *matRowDef="let row; columns: columnKeys()"></tr>
        </table>
      </div>

      @if (!loading() && data().length === 0) {
        <p class="dt__empty">{{ emptyMessage() }}</p>
      }

      @if (paginated()) {
        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="pageSizeOptions()"
          (page)="page.emit($event)"
          showFirstLastButtons
        />
      }
    </div>
  `,
  styles: `
    .dt__bar {
      min-height: 4px;
    }
    .dt__scroll {
      overflow-x: auto;
    }
    .dt__table {
      width: 100%;
      background: transparent;
    }
    .dt__table th.mat-mdc-header-cell {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--brand-slate-400);
      background: transparent;
      border-bottom: 1px solid var(--brand-slate-200);
      padding-top: 0.85rem;
      padding-bottom: 0.85rem;
    }
    .dt__table td.mat-mdc-cell {
      color: var(--brand-slate-700);
      border-bottom: 1px solid var(--brand-slate-100);
      padding-top: 0.6rem;
      padding-bottom: 0.6rem;
    }
    .dt__table tr.mat-mdc-row {
      transition: background 0.12s ease;
    }
    .dt__table tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: var(--brand-slate-50);
    }
    .dt__table tr.mat-mdc-row:last-child td.mat-mdc-cell {
      border-bottom: none;
    }
    .dt__empty {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class DataTableComponent<T> {
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly data = input.required<readonly T[]>();
  readonly total = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  readonly loading = input(false);
  readonly emptyMessage = input('No hay registros.');
  /** Muestra el paginador (servidor). Desactívalo para listas completas. */
  readonly paginated = input(true);

  /** Cambio de página/tamaño: el contenedor debe recargar desde el servidor. */
  readonly page = output<PageEvent>();

  private readonly cellDefs = contentChildren(DataTableCellDirective);

  readonly columnKeys = computed(() => this.columns().map((c) => c.key));

  /** Mapa columna -> plantilla personalizada (si la hay). */
  readonly templateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.cellDefs()) {
      map.set(def.columnKey(), def.template);
    }
    return map;
  });
}
