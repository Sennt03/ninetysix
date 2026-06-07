import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Ruta a la que enlaza. El último item (página actual) no debería llevar link. */
  link?: string;
}

/**
 * Migas de pan reutilizables. Muestra la jerarquía de navegación con enlaces a
 * los niveles superiores; el último elemento es la página actual (sin enlace).
 */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bc" aria-label="Ruta de navegación">
      @for (item of items(); track item.label; let last = $last) {
        @if (item.link && !last) {
          <a class="bc__link" [routerLink]="item.link">{{ item.label }}</a>
        } @else {
          <span class="bc__current" aria-current="page">{{ item.label }}</span>
        }
        @if (!last) {
          <mat-icon class="bc__sep">chevron_right</mat-icon>
        }
      }
    </nav>
  `,
  styles: `
    .bc {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
      font-size: 13px;
    }
    .bc__link {
      color: var(--brand-slate-500);
      text-decoration: none;
      transition: color 0.12s ease;
    }
    .bc__link:hover {
      color: var(--brand-slate-800);
      text-decoration: underline;
    }
    .bc__current {
      color: var(--brand-slate-700);
      font-weight: 600;
    }
    .bc__sep {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--brand-slate-300);
    }
  `,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
