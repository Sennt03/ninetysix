import { DatabaseType } from './database-type';

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[] | boolean;
  database: {
    type: DatabaseType;
    mongoUri?: string;
    url?: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  bcryptSaltRounds: number;
  enableSockets: boolean;
  throttle: {
    ttl: number;
    limit: number;
  };
  uploads: {
    dir: string;
    publicUrl: string;
  };
}

const parseCorsOrigins = (raw?: string): string[] | boolean => {
  if (!raw || raw.trim() === '*') return true; // permitir todos
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

/**
 * Config tipada que consumirá `ConfigService<AppConfig, true>`.
 * Los valores ya vienen validados por `envValidationSchema`.
 */
export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  database: {
    type: (process.env.DATABASE_TYPE as DatabaseType) ?? 'mongodb',
    mongoUri: process.env.MONGODB_URI,
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
  enableSockets: process.env.ENABLE_SOCKETS === 'true',
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
  uploads: {
    // Carpeta en disco donde se guardan los archivos subidos.
    dir: process.env.UPLOAD_DIR ?? './uploads',
    // Base pública para construir las URLs de los archivos servidos en /uploads.
    publicUrl:
      process.env.PUBLIC_URL ?? `http://localhost:${parseInt(process.env.PORT ?? '3000', 10)}`,
  },
});
