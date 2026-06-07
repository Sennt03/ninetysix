import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Envuelve toda respuesta exitosa en un sobre uniforme
 * `{ success, statusCode, data, timestamp }`.
 * Equivale (global y tipado) a tu `response.success` de la base en Node puro.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: T) => {
        // Las descargas (xlsx, etc.) se devuelven tal cual, sin el sobre JSON.
        if (data instanceof StreamableFile) {
          return data as unknown as ApiResponse<T>;
        }
        return {
          success: true as const,
          statusCode: response.statusCode,
          data: data ?? (null as T),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
