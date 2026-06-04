import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const raw =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string) ||
        '';
      const token = raw.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = this.config.get<string>('jwt.accessSecret');
      const payload = this.jwtService.verify(token, { secret }) as {
        sub: string;
        role?: string;
      };
      const userId = payload.sub;
      client.join(`user_${userId}`);
      (client.data as { userId?: string; role?: string }).userId = userId;
      if (payload.role === 'admin') {
        client.join('admin');
        (client.data as { role?: string }).role = 'admin';
      }
      this.logger.debug(`Socket connected user_${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client.data as { userId?: string })?.userId;
    if (userId) this.logger.debug(`Socket disconnected user_${userId}`);
  }

  emitToAll(event: string, payload: unknown) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    if (!this.server) return;
    this.server.to(`user_${userId}`).emit(event, payload);
  }

  emitToAdmins(event: string, payload: unknown) {
    if (!this.server) return;
    this.server.to('admin').emit(event, payload);
  }
}
