import { Routes } from '@angular/router';
import { StoreLayoutComponent } from './layout/store-layout.component';

/**
 * Rutas de la tienda pública (SSR). El layout es el padre común (header + footer).
 * Aquí se irán añadiendo: catálogo (PLP), producto (PDP), historia, tiendas, etc.
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
        path: 'historia',
        loadComponent: () =>
          import('./pages/historia/historia.component').then((m) => m.HistoriaComponent),
      },
      {
        path: 'resenas',
        loadComponent: () =>
          import('./pages/resenas/resenas.component').then((m) => m.ResenasComponent),
      },
      {
        path: 'redes',
        loadComponent: () => import('./pages/redes/redes.component').then((m) => m.RedesComponent),
      },
      {
        path: 'tiendas',
        loadComponent: () =>
          import('./pages/tiendas/tiendas.component').then((m) => m.TiendasComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
