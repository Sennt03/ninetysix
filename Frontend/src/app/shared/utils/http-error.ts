import { HttpErrorResponse } from '@angular/common/http';

/** Extrae un mensaje legible del error del backend (formato AllExceptionsFilter). */
export function getApiErrorMessage(error: unknown, fallback = 'Ha ocurrido un error'): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;
    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallback;
}
