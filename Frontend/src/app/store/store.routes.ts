import { Routes } from '@angular/router';
import { StoreLayoutComponent } from './layout/store-layout.component';

/**
 * Rutas de la tienda pública (SSR). El layout es el padre común (header + footer).
 */
export const STORE_ROUTES: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./pages/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
      },
      {
        path: 'destacados',
        loadComponent: () =>
          import('./pages/destacados/destacados.component').then((m) => m.DestacadosComponent),
      },
      {
        path: 'categoria/:slug',
        data: { hero: false },
        loadComponent: () =>
          import('./pages/categoria/categoria.component').then((m) => m.CategoriaComponent),
      },
      {
        path: 'producto/:slug',
        data: { hero: false },
        loadComponent: () =>
          import('./pages/producto/producto.component').then((m) => m.ProductoComponent),
      },
      {
        path: 'ubicaciones',
        loadComponent: () =>
          import('./pages/tiendas/tiendas.component').then((m) => m.TiendasComponent),
      },
      { path: 'tiendas', redirectTo: 'ubicaciones', pathMatch: 'full' },
      {
        path: 'redes',
        loadComponent: () => import('./pages/redes/redes.component').then((m) => m.RedesComponent),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./pages/contacto/contacto.component').then((m) => m.ContactoComponent),
      },
      {
        path: 'historia',
        loadComponent: () =>
          import('./pages/historia/historia.component').then((m) => m.HistoriaComponent),
      },
      {
        path: 'resenas',
        loadComponent: () =>
          import('./pages/resenas/resenas.component').then((m) => m.ResenasComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
