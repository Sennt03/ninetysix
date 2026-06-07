import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

/**
 * Protege rutas privadas. En SSR deja pasar (no hay sesión en el servidor);
 * el cliente revalida al hidratar.
 */
export const authGuard: CanActivateFn = () => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
