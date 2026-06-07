import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';

/**
 * Módulo de tiempo real. Se importa de forma condicional en AppModule
 * únicamente cuando ENABLE_SOCKETS=true.
 */
@Module({
  imports: [JwtModule.register({})],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class RealtimeModule {}
