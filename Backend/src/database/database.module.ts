import { DynamicModule, Global, Module } from '@nestjs/common';
import { getDatabaseType } from '../config/database-type';
import { MongooseDatabaseModule } from './mongoose/mongoose-database.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Punto único de selección de motor de base de datos.
 *
 * Según `DATABASE_TYPE` registra la conexión Mongoose (mongodb) o el cliente
 * Prisma (postgres | mysql). Los repositorios de cada feature reciben la
 * implementación concreta correspondiente (ver *.repository.provider.ts),
 * de modo que los services nunca dependen del motor.
 */
@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const useMongo = getDatabaseType() === 'mongodb';

    return {
      module: DatabaseModule,
      imports: [useMongo ? MongooseDatabaseModule : PrismaModule],
    };
  }
}
