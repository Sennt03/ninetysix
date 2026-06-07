import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { SKIP_AUTH } from './skip-auth.context';

/**
 * Ante un 401: intenta renovar con el refresh token y reintenta la petición.
 * Si la renovación falla, cierra sesión y redirige al login.
 */
export const sessionHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!auth.refreshToken) {
        auth.logout();
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() => {
          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${auth.accessToken}` },
          });
          return next(retried);
        }),
        catchError((refreshError) => {
          notify.error('Tu sesión ha expirado, inicia sesión de nuevo');
          auth.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
