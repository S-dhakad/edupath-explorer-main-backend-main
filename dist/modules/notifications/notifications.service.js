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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const mongoose_2 = require("mongoose");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const notification_schema_1 = require("./notification.schema");
const app_constants_1 = require("../../common/constants/app.constants");
const notifications_gateway_1 = require("./notifications.gateway");
const user_schema_1 = require("../users/user.schema");
let NotificationsService = class NotificationsService {
    constructor(model, userModel, gateway, jwtService) {
        this.model = model;
        this.userModel = userModel;
        this.gateway = gateway;
        this.jwtService = jwtService;
        this.userStreams = new Map();
        this.adminStream = new rxjs_1.Subject();
    }
    streamForUser(userId) {
        if (!this.userStreams.has(userId)) {
            this.userStreams.set(userId, new rxjs_1.Subject());
        }
        return this.userStreams.get(userId);
    }
    pushStream(userId, event, payload) {
        this.streamForUser(userId).next({ event, ...payload });
    }
    verifyTokenPayload(token) {
        try {
            return this.jwtService.verify(token.replace(/^Bearer\s+/i, '').trim());
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    subscribeEvents(token) {
        const { sub: userId } = this.verifyTokenPayload(token);
        return this.streamForUser(userId).pipe((0, operators_1.map)((payload) => ({ data: payload })));
    }
    subscribeAdminEvents(token) {
        const payload = this.verifyTokenPayload(token);
        if (payload.role !== app_constants_1.UserRole.ADMIN) {
            throw new common_1.UnauthorizedException('Admin only');
        }
        return this.adminStream.pipe((0, operators_1.map)((p) => ({ data: p })));
    }
    async create(userId, type, title, body, data) {
        const doc = await this.model.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            type,
            title,
            body,
            data,
        });
        const json = doc.toJSON();
        this.gateway.emitToUser(userId, 'notification', json);
        this.pushStream(userId, 'notification', json);
        return doc;
    }
    emitWithdrawalUpdated(userId, payload) {
        this.gateway.emitToUser(userId, 'withdrawal_updated', payload);
        this.pushStream(userId, 'withdrawal_updated', payload);
    }
    async notifyAdmins(type, title, body, data) {
        const adminIds = await this.userModel
            .find({ role: app_constants_1.UserRole.ADMIN })
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
    list(userId, page = 1, limit = 30) {
        return this.model
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
    }
    async markRead(userId, id) {
        return this.model
            .findOneAndUpdate({ _id: id, userId: new mongoose_2.Types.ObjectId(userId) }, { read: true }, { new: true })
            .exec();
    }
    async broadcast(payload) {
        const type = resolveNotificationType(payload.type);
        const userIds = await this.userModel.distinct('_id').lean().exec()
            .then((ids) => ids.map((id) => id.toString()));
        if (!userIds.length)
            return { sent: 0 };
        const docs = userIds.map((uid) => ({
            userId: new mongoose_2.Types.ObjectId(uid),
            type,
            title: payload.title,
            body: payload.body,
        }));
        await this.model.insertMany(docs);
        for (const uid of userIds) {
            this.gateway.emitToUser(uid, 'notification', {
                type,
                title: payload.title,
                body: payload.body,
            });
        }
        return { sent: userIds.length };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway,
        jwt_1.JwtService])
], NotificationsService);
function resolveNotificationType(raw) {
    const key = raw?.trim().toLowerCase();
    if (!key)
        return app_constants_1.NotificationType.SYSTEM;
    const aliases = {
        system: app_constants_1.NotificationType.SYSTEM,
        alert: app_constants_1.NotificationType.SYSTEM,
        info: app_constants_1.NotificationType.SYSTEM,
        general: app_constants_1.NotificationType.SYSTEM,
        promo: app_constants_1.NotificationType.COUPON_USED,
        promotion: app_constants_1.NotificationType.COUPON_USED,
        offer: app_constants_1.NotificationType.COUPON_USED,
        sale: app_constants_1.NotificationType.NEW_SALE,
    };
    if (aliases[key])
        return aliases[key];
    const allowed = Object.values(app_constants_1.NotificationType);
    if (allowed.includes(key))
        return key;
    return app_constants_1.NotificationType.SYSTEM;
}
//# sourceMappingURL=notifications.service.js.map