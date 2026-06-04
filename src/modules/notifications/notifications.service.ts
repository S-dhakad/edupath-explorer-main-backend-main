import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification, NotificationDocument } from './notification.schema';
import { NotificationType, UserRole } from '../../common/constants/app.constants';
import { NotificationsGateway } from './notifications.gateway';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class NotificationsService {
  private readonly userStreams = new Map<string, Subject<Record<string, unknown>>>();
  private readonly adminStream = new Subject<Record<string, unknown>>();

  constructor(
    @InjectModel(Notification.name) private model: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly gateway: NotificationsGateway,
    private readonly jwtService: JwtService,
  ) {}

  private streamForUser(userId: string): Subject<Record<string, unknown>> {
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject());
    }
    return this.userStreams.get(userId)!;
  }

  private pushStream(userId: string, event: string, payload: Record<string, unknown>) {
    this.streamForUser(userId).next({ event, ...payload });
  }

  private verifyTokenPayload(token: string): { sub: string; role?: string } {
    try {
      return this.jwtService.verify(token.replace(/^Bearer\s+/i, '').trim()) as {
        sub: string;
        role?: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /** Server-Sent Events for live UI updates (no socket.io client needed). */
  subscribeEvents(token: string): Observable<MessageEvent> {
    const { sub: userId } = this.verifyTokenPayload(token);
    return this.streamForUser(userId).pipe(
      map((payload) => ({ data: payload }) as MessageEvent),
    );
  }

  subscribeAdminEvents(token: string): Observable<MessageEvent> {
    const payload = this.verifyTokenPayload(token);
    if (payload.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin only');
    }
    return this.adminStream.pipe(map((p) => ({ data: p }) as MessageEvent));
  }

  async create(userId: string, type: NotificationType, title: string, body: string, data?: object) {
    const doc = await this.model.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      data,
    });
    const json = doc.toJSON() as Record<string, unknown>;
    this.gateway.emitToUser(userId, 'notification', json);
    this.pushStream(userId, 'notification', json);
    return doc;
  }

  /** Real-time wallet / withdrawals UI refresh for a user. */
  emitWithdrawalUpdated(
    userId: string,
    payload: {
      withdrawalId: string;
      amount: number;
      status: string;
      adminNote?: string;
      payoutId?: string;
      payoutStatus?: string;
    },
  ) {
    this.gateway.emitToUser(userId, 'withdrawal_updated', payload);
    this.pushStream(userId, 'withdrawal_updated', payload);
  }

  /** Notify all admins (dashboard + withdrawal queue). */
  async notifyAdmins(
    type: NotificationType,
    title: string,
    body: string,
    data?: object,
  ) {
    const adminIds = await this.userModel
      .find({ role: UserRole.ADMIN })
      .select('_id')
      .lean()
      .exec()
      .then((rows) => rows.map((r) => r._id.toString()));

    for (const adminId of adminIds) {
      await this.create(adminId, type, title, body, data);
    }
    const adminPayload = { event: 'withdrawal_updated', forAdmin: true, ...data };
    this.gateway.emitToAdmins('withdrawal_updated', adminPayload);
    this.adminStream.next(adminPayload);
  }

  list(userId: string, page = 1, limit = 30) {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async markRead(userId: string, id: string) {
    return this.model
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { read: true },
        { new: true },
      )
      .exec();
  }

  /** Send a notification to ALL users (admin broadcast). */
  async broadcast(payload: { title: string; body: string; type?: string }) {
    const type = resolveNotificationType(payload.type);
    // Fetch all user IDs in batches to avoid memory issues
    const userIds: string[] = await this.userModel.distinct('_id').lean().exec()
      .then((ids: any[]) => ids.map((id) => id.toString()));

    if (!userIds.length) return { sent: 0 };

    const docs = userIds.map((uid) => ({
      userId: new Types.ObjectId(uid),
      type,
      title: payload.title,
      body: payload.body,
    }));

    await this.model.insertMany(docs);

    // Emit via WebSocket to all connected users
    for (const uid of userIds) {
      this.gateway.emitToUser(uid, 'notification', {
        type,
        title: payload.title,
        body: payload.body,
      });
    }

    return { sent: userIds.length };
  }
}

/** Admin UI may send `SYSTEM` — schema stores lowercase enum values. */
function resolveNotificationType(raw?: string): NotificationType {
  const key = raw?.trim().toLowerCase();
  if (!key) return NotificationType.SYSTEM;

  const aliases: Record<string, NotificationType> = {
    system: NotificationType.SYSTEM,
    alert: NotificationType.SYSTEM,
    info: NotificationType.SYSTEM,
    general: NotificationType.SYSTEM,
    promo: NotificationType.COUPON_USED,
    promotion: NotificationType.COUPON_USED,
    offer: NotificationType.COUPON_USED,
    sale: NotificationType.NEW_SALE,
  };
  if (aliases[key]) return aliases[key];

  const allowed = Object.values(NotificationType) as string[];
  if (allowed.includes(key)) return key as NotificationType;

  return NotificationType.SYSTEM;
}
