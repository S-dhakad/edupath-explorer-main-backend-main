import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Notification, NotificationDocument } from './notification.schema';
import { NotificationType } from '../../common/constants/app.constants';
import { NotificationsGateway } from './notifications.gateway';
import { UserDocument } from '../users/user.schema';
export declare class NotificationsService {
    private model;
    private userModel;
    private readonly gateway;
    private readonly jwtService;
    private readonly userStreams;
    private readonly adminStream;
    constructor(model: Model<NotificationDocument>, userModel: Model<UserDocument>, gateway: NotificationsGateway, jwtService: JwtService);
    private streamForUser;
    private pushStream;
    private verifyTokenPayload;
    subscribeEvents(token: string): Observable<MessageEvent>;
    subscribeAdminEvents(token: string): Observable<MessageEvent>;
    create(userId: string, type: NotificationType, title: string, body: string, data?: object): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    emitWithdrawalUpdated(userId: string, payload: {
        withdrawalId: string;
        amount: number;
        status: string;
        adminNote?: string;
        payoutId?: string;
        payoutStatus?: string;
    }): void;
    notifyAdmins(type: NotificationType, title: string, body: string, data?: object): Promise<void>;
    list(userId: string, page?: number, limit?: number): import("mongoose").Query<(import("mongoose").FlattenMaps<NotificationDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, {}, NotificationDocument, "find", {}>;
    markRead(userId: string, id: string): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    broadcast(payload: {
        title: string;
        body: string;
        type?: string;
    }): Promise<{
        sent: number;
    }>;
}
