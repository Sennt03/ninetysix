import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '@env/environment';

/**
 * Durante el SSR, el render hace `fetch` a la API. Si usara la URL pública
 * (`https://ninetysixshop.com/api`) la petición SALDRÍA por el proxy de Hostinger
 * y volvería a ENTRAR al mismo proceso Node: dobla la carga, añade latencia y
 * puede auto-bloquearse bajo tráfico (el render espera su propia respuesta, en
 * cola detrás de él) -> picos de RAM y caídas.
 *
 * Aquí reescribimos esas llamadas para que en el servidor vayan por loopback
 * local (`http://127.0.0.1:<PORT>`), donde el backend NestJS atiende en el mismo
 * proceso. En el navegador es un no-op (se sigue usando la URL pública).
 */
export const ssrApiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const isServer = isPlatformServer(inject(PLATFORM_ID));
  if (!isServer || !req.url.startsWith(environment.url_base)) {
    return next(req);
  }
  // `process` solo existe en Node; se accede vía globalThis para no romper el
  // bundle del navegador (esta rama nunca se ejecuta allí).
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  const port = env?.['PORT'] ?? '3000';
  const localUrl = req.url.replace(environment.url_base, `http://127.0.0.1:${port}`);
  return next(req.clone({ url: localUrl }));
};
