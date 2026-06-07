"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let AppGateway = AppGateway_1 = class AppGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AppGateway_1.name);
    }
    afterInit() {
        this.logger.log('Gateway WebSocket inicializado');
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('jwt.accessSecret', { infer: true }),
            });
            client.data.user = { id: payload.sub, email: payload.email, roles: payload.roles };
            await client.join(`user:${payload.sub}`);
            this.logger.log(`Cliente conectado: ${client.id} (user ${payload.sub})`);
            this.broadcastPresence();
        }
        catch {
            this.logger.warn(`Conexión WS rechazada: ${client.id}`);
            client.emit('error', 'Unauthorized');
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
        this.broadcastPresence();
    }
    handlePing(client, data) {
        return { event: 'pong', data, from: client.data.user?.id, at: new Date().toISOString() };
    }
    emitToUser(userId, event, payload) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }
    broadcastPresence() {
        this.server.emit('presence:update', { online: this.server.sockets.sockets.size });
    }
    extractToken(client) {
        const fromAuth = client.handshake.auth?.token;
        const header = client.handshake.headers?.authorization;
        const raw = fromAuth ?? (typeof header === 'string' ? header : undefined);
        if (!raw) {
            throw new common_1.UnauthorizedException();
        }
        return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handlePing", null);
exports.AppGateway = AppGateway = AppGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: true } }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AppGateway);
//# sourceMappingURL=app.gateway.js.map