import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppConfig } from '../config/configuration';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService<AppConfig, true>);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket, data: unknown): {
        event: string;
        data: unknown;
        from: any;
        at: string;
    };
    emitToUser(userId: string, event: string, payload: unknown): void;
    private broadcastPresence;
    private extractToken;
}
