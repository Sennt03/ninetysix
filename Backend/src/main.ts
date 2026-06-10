import 'dotenv/config'; // carga .env ANTES de evaluar los módulos (ver database-type.ts)

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config: ConfigService<AppConfig, true> = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const apiPrefix = config.get('apiPrefix', { infer: true });
  app.setGlobalPrefix(apiPrefix);

  // Archivos subidos servidos como estáticos en /uploads (fuera del prefijo de API).
  // Cache-Control largo + immutable: los nombres son UUID (un asset nunca cambia
  // de contenido), así el navegador/proxy de Hostinger cachean las imágenes y se
  // evitan lecturas de disco repetidas en cada visita (baja el IOPS).
  const uploadDir = resolve(config.get('uploads.dir', { infer: true }));
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads',
    maxAge: '30d',
    immutable: true,
  });

  // Seguridad. crossOriginResourcePolicy en cross-origin para que el frontend
  // (otro puerto/origen) pueda cargar las imágenes servidas en /uploads.
  // contentSecurityPolicy desactivado: la CSP por defecto de helmet rompe el
  // HTML/JS que inyecta Angular SSR cuando lo sirve este mismo proceso (prod).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: config.get('corsOrigins', { infer: true }),
    credentials: true,
  });

  // Validación global de DTOs (la "mejor opción" en Nest: class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina props no declaradas en el DTO
      forbidNonWhitelisted: true, // y rechaza si llegan props desconocidas
      transform: true, // instancia y castea tipos automáticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Cierra conexiones de BD (onModuleDestroy) al apagar
  app.enableShutdownHooks();

  // Documentación OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest API Base')
    .setDescription('Auth JWT + refresh + RBAC · BD seleccionable (Mongo/SQL) · sockets opcionales')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ---------------------------------------------------------------------------
  // Frontend Angular (SSR) servido por ESTE MISMO proceso (1 sola app en prod).
  // Con SERVE_FRONTEND=true montamos el handler del SSR. Hay que registrarlo
  // ANTES de listen() (Nest instala su propio 404 al final del init y taparía
  // cualquier middleware posterior). Por eso dejamos pasar a Nest las rutas de
  // API/docs/uploads con next() y el resto (la tienda) lo renderiza Angular.
  // El bundle server.mjs es ESM y autocontenido (no necesita node_modules del
  // frontend).
  // ---------------------------------------------------------------------------
  if (process.env.SERVE_FRONTEND === 'true') {
    // El bundle va DENTRO de dist/ (dist/frontend) porque Hostinger solo
    // despliega la carpeta dist; el build lo copia ahí (ver scripts/copy-frontend.cjs).
    const entry =
      process.env.FRONTEND_SSR_ENTRY ??
      resolve(__dirname, 'frontend/server/server.mjs');
    try {
      // import() dinámico real: TS bajaría import() a require() en CommonJS y
      // require no puede cargar ESM. El wrapper en Function lo evita.
      const importEsm = new Function('p', 'return import(p)') as (
        p: string,
      ) => Promise<{ reqHandler: import('express').RequestHandler }>;
      const { reqHandler } = await importEsm(pathToFileURL(entry).href);

      const passthrough = [`/${apiPrefix}`, '/docs', '/uploads'];
      app.use((req: Request, res: Response, next: NextFunction) => {
        const path = req.path;
        if (passthrough.some((p) => path === p || path.startsWith(`${p}/`))) {
          return next(); // deja que lo gestione Nest (API, Swagger, estáticos)
        }
        return reqHandler(req, res, next); // lo renderiza Angular
      });
      logger.log(`Front -> SSR Angular servido desde ${entry}`);
    } catch (err) {
      // Si el bundle no está, la API sigue funcionando (no tiramos el proceso).
      logger.error(
        `No se pudo cargar el SSR del frontend (${entry}); la API sigue activa.`,
        err as Error,
      );
    }
  }

  const port = config.get('port', { infer: true });
  await app.listen(port);

  logger.log(`API  -> http://localhost:${port}/${apiPrefix}`);
  logger.log(`Docs -> http://localhost:${port}/docs`);
  logger.log(`DB   -> ${config.get('database.type', { infer: true })}`);
}

void bootstrap();
