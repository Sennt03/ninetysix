import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  // Registro público deshabilitado: solo un ADMIN da de alta usuarios desde el
  // panel. El RegisterComponent se conserva (sin ruta) por si se reactiva.
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
