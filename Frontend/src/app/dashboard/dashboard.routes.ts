import { Routes } from '@angular/router';
import { roleGuard } from '@shared/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'media',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./media/media.component').then((m) => m.MediaComponent),
      },
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'products/new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/import',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'], type: 'products' },
        loadComponent: () =>
          import('./import/import-upload.component').then((m) => m.ImportUploadComponent),
      },
      {
        path: 'products/images/import',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./import/import-images.component').then((m) => m.ImportImagesComponent),
      },
      {
        path: 'products/:id/edit',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'categories/import',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'], type: 'categories' },
        loadComponent: () =>
          import('./import/import-upload.component').then((m) => m.ImportUploadComponent),
      },
      {
        path: 'import',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./import/import-hub.component').then((m) => m.ImportHubComponent),
      },
      {
        path: 'import/history',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./import/import-history.component').then((m) => m.ImportHistoryComponent),
      },
      {
        path: 'import/jobs/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./import/import-job-detail.component').then((m) => m.ImportJobDetailComponent),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
