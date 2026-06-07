import * as Joi from 'joi';

/**
 * Validación de variables de entorno al arrancar (fail-fast).
 * Si falta o es inválida alguna variable, la app NO arranca y avisa por qué.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),
  CORS_ORIGINS: Joi.string().default('*'),

  // Base de datos
  DATABASE_TYPE: Joi.string().valid('mongodb', 'postgres', 'mysql').default('mongodb'),
  MONGODB_URI: Joi.string().when('DATABASE_TYPE', {
    is: 'mongodb',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DATABASE_URL: Joi.string().when('DATABASE_TYPE', {
    is: Joi.valid('postgres', 'mysql'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().min(4).max(15).default(10),

  // Sockets
  ENABLE_SOCKETS: Joi.boolean().default(false),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Archivos / subidas (opcional: defaults para desarrollo)
  UPLOAD_DIR: Joi.string().default('./uploads'),
  PUBLIC_URL: Joi.string().optional(),
});
