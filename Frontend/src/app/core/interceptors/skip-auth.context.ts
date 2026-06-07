import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Marca una petición para que NO se le añada el token ni se le aplique el
 * manejo de sesión (login, register, refresh).
 */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const skipAuth = (): HttpContext => new HttpContext().set(SKIP_AUTH, true);
