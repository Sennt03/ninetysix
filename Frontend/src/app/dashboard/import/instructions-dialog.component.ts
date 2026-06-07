import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ImportColumn } from '@models/import.models';
import { ImportService } from '@services/import.service';
import { materialImports } from '@shared/material/material.imports';

export interface InstructionsData {
  type: 'products' | 'categories';
}

/** Diálogo que documenta cada cabecera del Excel (botón "Instrucciones"). */
@Component({
  selector: 'app-instructions-dialog',
  imports: [MatDialogModule, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Instrucciones del archivo</h2>
    <mat-dialog-content>
      <p class="hint">
        Descarga la plantilla de ejemplo y respeta las cabeceras de la primera fila. El orden de
        las columnas no importa; las que no apliquen pueden dejarse vacías.
        @if (data.type === 'products') {
          <span
            >Las variantes de un mismo producto se ponen en varias filas con el mismo
            <strong>Handle</strong>.</span
          >
        }
      </p>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <table class="cols">
        <thead>
          <tr>
            <th>Columna</th>
            <th>Obligatorio</th>
            <th>Descripción</th>
            <th>Ejemplo</th>
          </tr>
        </thead>
        <tbody>
          @for (col of columns(); track col.key) {
            <tr>
              <td class="cols__name">{{ col.header }}</td>
              <td>
                @if (col.required) {
                  <span class="req">Sí</span>
                } @else {
                  No
                }
              </td>
              <td>{{ col.help }}</td>
              <td class="cols__ex">{{ col.example || '—' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Entendido</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      max-width: 820px;
    }
    .hint {
      color: var(--brand-slate-600);
      margin-top: 0;
    }
    .cols {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .cols th {
      text-align: left;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--brand-slate-400);
      border-bottom: 1px solid var(--brand-slate-200);
      padding: 8px 10px;
    }
    .cols td {
      border-bottom: 1px solid var(--brand-slate-100);
      padding: 8px 10px;
      vertical-align: top;
      color: var(--brand-slate-700);
    }
    .cols__name {
      font-weight: 600;
      white-space: nowrap;
    }
    .cols__ex {
      color: var(--brand-slate-500);
      font-family: monospace;
      font-size: 12px;
    }
    .req {
      color: var(--brand-success);
      font-weight: 600;
    }
  `,
})
export class InstructionsDialogComponent {
  readonly data = inject<InstructionsData>(MAT_DIALOG_DATA);
  private readonly importService = inject(ImportService);

  readonly columns = signal<ImportColumn[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.importService.columns(this.data.type).subscribe({
      next: (cols) => {
        this.columns.set(cols);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
