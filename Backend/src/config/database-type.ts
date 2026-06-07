/**
 * Tipo de base de datos activo.
 *
 * Se lee de `process.env` (no del ConfigService) porque algunos módulos
 * deciden QUÉ proveedores registrar en tiempo de definición del decorador
 * `@Module`, que se evalúa antes de que Nest construya el ConfigModule.
 * Por eso `import 'dotenv/config'` es la primera línea de `main.ts`.
 */
export type DatabaseType = 'mongodb' | 'postgres' | 'mysql';

export const getDatabaseType = (): DatabaseType =>
  (process.env.DATABASE_TYPE as DatabaseType) ?? 'mongodb';

export const isMongo = (): boolean => getDatabaseType() === 'mongodb';

export const isSql = (): boolean => !isMongo();
