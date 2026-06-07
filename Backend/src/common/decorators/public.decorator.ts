import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (sin JWT). El JwtAuthGuard global lo respeta.
 * Uso: `@Public()` sobre el handler o el controlador.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
