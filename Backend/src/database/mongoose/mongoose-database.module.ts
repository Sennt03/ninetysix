import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from '../../config/configuration';

/**
 * Establece la conexión raíz de Mongoose. Solo se importa cuando
 * DATABASE_TYPE = mongodb (lo decide DatabaseModule).
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        uri: config.get('database.mongoUri', { infer: true }),
      }),
    }),
  ],
})
export class MongooseDatabaseModule {}
