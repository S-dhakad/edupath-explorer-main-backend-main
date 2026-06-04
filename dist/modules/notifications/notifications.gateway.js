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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
    }
    handleConnection(client) {
        try {
            const raw = client.handshake.auth?.token ||
                client.handshake.query?.token ||
                '';
            const token = raw.replace(/^Bearer\s+/i, '').trim();
            if (!token) {
                client.disconnect();
                return;
            }
            const secret = this.config.get('jwt.accessSecret');
            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.sub;
            client.join(`user_${userId}`);
            client.data.userId = userId;
            if (payload.role === 'admin') {
                client.join('admin');
                client.data.role = 'admin';
            }
            this.logger.debug(`Socket connected user_${userId}`);
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data?.userId;
        if (userId)
            this.logger.debug(`Socket disconnected user_${userId}`);
    }
    emitToAll(event, payload) {
        if (!this.server)
            return;
        this.server.emit(event, payload);
    }
    emitToUser(userId, event, payload) {
        if (!this.server)
            return;
        this.server.to(`user_${userId}`).emit(event, payload);
    }
    emitToAdmins(event, payload) {
        if (!this.server)
            return;
        this.server.to('admin').emit(event, payload);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map