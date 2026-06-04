import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly config;
    private readonly logger;
    server: Server;
    constructor(jwtService: JwtService, config: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitToAll(event: string, payload: unknown): void;
    emitToUser(userId: string, event: string, payload: unknown): void;
    emitToAdmins(event: string, payload: unknown): void;
}
