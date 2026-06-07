import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppConfig } from '../config/configuration';
import { JwtPayload } from '../modules/auth/interfaces/jwt-payload.interface';

/**
 * Gateway de ejemplo. Autentica cada conexión con el access token en el
 * handshake (`auth.token` o cabecera Authorization) y mete a cada usuario en
 * una sala privada `user:<id>` para poder enviarle eventos dirigidos.
 *
 * Solo se carga si ENABLE_SOCKETS=true (ver AppModule).
 */
@WebSocketGateway({ cors: { origin: true } })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  afterInit(): void {
    this.logger.log('Gateway WebSocket inicializado');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('jwt.accessSecret', { infer: true }),
      });
      client.data.user = { id: payload.sub, email: payload.email, roles: payload.roles };
      await client.join(`user:${payload.sub}`);
      this.logger.log(`Cliente conectado: ${client.id} (user ${payload.sub})`);
      this.broadcastPresence();
    } catch {
      this.logger.warn(`Conexión WS rechazada: ${client.id}`);
      client.emit('error', 'Unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    this.broadcastPresence();
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: unknown) {
    return { event: 'pong', data, from: client.data.user?.id, at: new Date().toISOString() };
  }

  /** Utilidad para que otros servicios emitan a un usuario concreto. */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  private broadcastPresence(): void {
    this.server.emit('presence:update', { online: this.server.sockets.sockets.size });
  }

  private extractToken(client: Socket): string {
    const fromAuth = client.handshake.auth?.token as string | undefined;
    const header = client.handshake.headers?.authorization;
    const raw = fromAuth ?? (typeof header === 'string' ? header : undefined);
    if (!raw) {
      throw new UnauthorizedException();
    }
    return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  }
}
