import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** En producción solo se loguean errores y peticiones lentas (umbral en ms). */
const SLOW_REQUEST_MS = 1000;
const isProd = process.env.NODE_ENV === 'production';

/**
 * Log de peticiones HTTP. En desarrollo registra todas; en producción SOLO los
 * errores (>=400) y las peticiones lentas. Loguear cada request a disco (stdout
 * -> fichero de Passenger en Hostinger) dispara el IOPS de forma constante.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const ms = Date.now() - start;
        const noisy = isProd && res.statusCode < 400 && ms < SLOW_REQUEST_MS;
        if (noisy) return; // en prod no ensuciamos el disco con cada 200 rápido
        const line = `${method} ${originalUrl} ${res.statusCode} +${ms}ms`;
        if (res.statusCode >= 400) this.logger.warn(line);
        else this.logger.log(line);
      }),
    );
  }
}
