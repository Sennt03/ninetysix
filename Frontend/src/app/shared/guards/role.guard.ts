import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Role } from '@models/user.models';

/**
 * Restringe por rol. Define los roles requeridos en la ruta:
 *   { path: 'users', canActivate: [roleGuard], data: { roles: ['ADMIN'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const required = (route.data['roles'] as Role[] | undefined) ?? [];

  if (required.length === 0 || required.some((role) => auth.hasRole(role))) {
    return true;
  }

  return router.createUrlTree(['/']);
};
