import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guard';
import { noAuthGuard } from '@shared/guards/no-auth.guard';

export const routes: Routes = [
  {
    // Autenticación (SPA, sin SSR).
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    // Panel de administración (SPA tras login, sin SSR).
    path: 'panel',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    // Tienda pública (SSR para SEO). Debe ir al final: ocupa la raíz.
    path: '',
    loadChildren: () => import('./store/store.routes').then((m) => m.STORE_ROUTES),
  },
];
