import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { materialImports } from '@shared/material/material.imports';
import { map } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  exact: boolean;
  adminOnly: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ...materialImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly breakpoints = inject(BreakpointObserver);

  readonly user = this.auth.user;
  readonly isAdmin = this.auth.isAdmin;

  readonly isHandset = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );
  readonly opened = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Inicio', icon: 'dashboard', link: '/panel', exact: true, adminOnly: false },
    { label: 'Productos', icon: 'inventory_2', link: '/panel/products', exact: false, adminOnly: true },
    { label: 'Categorías', icon: 'category', link: '/panel/categories', exact: false, adminOnly: true },
    { label: 'Archivos', icon: 'photo_library', link: '/panel/media', exact: false, adminOnly: true },
    { label: 'Carga masiva', icon: 'upload_file', link: '/panel/import', exact: true, adminOnly: true },
    { label: 'Usuarios', icon: 'group', link: '/panel/users', exact: false, adminOnly: true },
    { label: 'Mi perfil', icon: 'person', link: '/panel/profile', exact: false, adminOnly: false },
  ];

  constructor() {
    // Abierto en escritorio, cerrado en móvil.
    effect(() => this.opened.set(!this.isHandset()));
  }

  toggle(): void {
    this.opened.set(!this.opened());
  }

  closeIfHandset(): void {
    if (this.isHandset()) {
      this.opened.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
