import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpThrottlerGuard } from './common/guards/throttler.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import configuration, { AppConfig } from './config/configuration';
import { isSql } from './config/database-type';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ImportModule } from './modules/import/import.module';
import { MediaModule } from './modules/media/media.module';
import { ProductsModule } from './modules/products/products.module';
import { StorefrontModule } from './modules/storefront/storefront.module';
import { UsersModule } from './modules/users/users.module';
import { RealtimeModule } from './realtime/realtime.module';

// Módulo de sockets cargado solo si se activa por ENV.
const optionalModules = process.env.ENABLE_SOCKETS === 'true' ? [RealtimeModule] : [];

// El catálogo es relacional (Prisma): solo se carga con una BD SQL.
// MediaModule va primero porque products/categories dependen de él.
// ImportModule (carga masiva) va al final: depende de products/categories/media.
const catalogModules = isSql()
  ? [MediaModule, CategoriesModule, ProductsModule, ImportModule, StorefrontModule]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        throttlers: [
          {
            ttl: config.get('throttle.ttl', { infer: true }),
            limit: config.get('throttle.limit', { infer: true }),
          },
        ],
      }),
    }),
    DatabaseModule.forRoot(),
    UsersModule,
    AuthModule,
    ...catalogModules,
    ...optionalModules,
  ],
  controllers: [AppController],
  providers: [
    // Orden importa: autenticación -> autorización -> rate limit.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
