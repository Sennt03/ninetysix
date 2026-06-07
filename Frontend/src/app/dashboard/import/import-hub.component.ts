import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImportService } from '@services/import.service';
import { NotificationService } from '@services/notification.service';
import { materialImports } from '@shared/material/material.imports';
import { saveBlob } from '@shared/utils/download';

interface HubCard {
  title: string;
  desc: string;
  icon: string;
  link: string;
}

/** Punto de entrada de la carga masiva: importar, exportar e historial. */
@Component({
  selector: 'app-import-hub',
  imports: [RouterLink, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './import.scss',
  template: `
    <section class="imp">
      <header class="imp__header">
        <div class="imp__heading">
          <h1 class="imp__title">Carga masiva</h1>
          <p class="imp__muted">Importa y exporta tu catálogo en lote mediante archivos Excel.</p>
        </div>
        <div class="imp__actions">
          <button mat-stroked-button routerLink="/panel/import/history">
            <mat-icon>history</mat-icon> Historial
          </button>
        </div>
      </header>

      <div class="hub">
        @for (card of cards; track card.link) {
          <a class="hub__card" [routerLink]="card.link">
            <mat-icon class="hub__icon">{{ card.icon }}</mat-icon>
            <span class="hub__title">{{ card.title }}</span>
            <span class="hub__desc">{{ card.desc }}</span>
          </a>
        }
      </div>

      <mat-card appearance="outlined" class="hub__export">
        <h2 class="hub__h2">Exportar</h2>
        <p class="imp__muted">Descarga el catálogo en Excel re-importable (mismo formato de importación).</p>
        <div class="hub__exportbtns">
          <button mat-stroked-button [disabled]="exporting()" (click)="exportProducts()">
            <mat-icon>file_download</mat-icon> Exportar productos
          </button>
          <button mat-stroked-button [disabled]="exporting()" (click)="exportCategories()">
            <mat-icon>file_download</mat-icon> Exportar categorías
          </button>
        </div>
      </mat-card>
    </section>
  `,
  styles: `
    .hub {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }
    .hub__card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 20px;
      border: 1px solid var(--brand-slate-200);
      border-radius: 14px;
      background: var(--brand-surface);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease;
    }
    .hub__card:hover {
      border-color: var(--brand-slate-400);
      box-shadow: var(--brand-shadow-sm);
      transform: translateY(-1px);
    }
    .hub__icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: var(--brand-slate-700);
    }
    .hub__title {
      font-weight: 700;
      font-size: 1.02rem;
    }
    .hub__desc {
      color: var(--brand-slate-500);
      font-size: 13px;
    }
    .hub__export {
      padding: 18px;
    }
    .hub__h2 {
      margin: 0 0 2px;
      font-size: 1.05rem;
      font-weight: 700;
    }
    .hub__exportbtns {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
  `,
})
export class ImportHubComponent {
  private readonly importService = inject(ImportService);
  private readonly notify = inject(NotificationService);

  readonly exporting = signal(false);

  readonly cards: HubCard[] = [
    {
      title: 'Importar productos',
      desc: 'Sube un Excel con productos, variantes e imágenes por URL.',
      icon: 'inventory_2',
      link: '/panel/products/import',
    },
    {
      title: 'Importar categorías',
      desc: 'Crea o actualiza categorías y su jerarquía desde un Excel.',
      icon: 'category',
      link: '/panel/categories/import',
    },
    {
      title: 'Cargar imágenes',
      desc: 'Sube un ZIP de fotos y asígnalas por SKU o slug.',
      icon: 'photo_library',
      link: '/panel/products/images/import',
    },
  ];

  exportProducts(): void {
    this.exporting.set(true);
    this.importService.exportProducts({}).subscribe({
      next: (blob) => {
        saveBlob(blob, 'productos.xlsx');
        this.exporting.set(false);
      },
      error: () => {
        this.exporting.set(false);
        this.notify.error('No se pudo exportar');
      },
    });
  }

  exportCategories(): void {
    this.exporting.set(true);
    this.importService.exportCategories().subscribe({
      next: (blob) => {
        saveBlob(blob, 'categorias.xlsx');
        this.exporting.set(false);
      },
      error: () => {
        this.exporting.set(false);
        this.notify.error('No se pudo exportar');
      },
    });
  }
}
