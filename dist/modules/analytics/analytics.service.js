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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const purchase_schema_1 = require("../purchases/purchase.schema");
const user_schema_1 = require("../users/user.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let AnalyticsService = class AnalyticsService {
    constructor(commissionModel, purchaseModel, userModel) {
        this.commissionModel = commissionModel;
        this.purchaseModel = purchaseModel;
        this.userModel = userModel;
    }
    async earningsSeries(userId, granularity = 'day', days = 30) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const since = new Date();
        since.setDate(since.getDate() - days);
        const format = granularity === 'month' ? '%Y-%m' : '%Y-%m-%d';
        return this.commissionModel.aggregate([
            {
                $match: {
                    beneficiaryUserId: uid,
                    incomeCategory: { $in: ['active', 'passive'] },
                    createdAt: { $gte: since },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format, date: '$createdAt' } },
                    active: {
                        $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] },
                    },
                    passive: {
                        $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async dashboardSummary(userId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const sinceDay = new Date();
        sinceDay.setHours(0, 0, 0, 0);
        const sinceWeek = new Date();
        sinceWeek.setDate(sinceWeek.getDate() - 7);
        const sinceMonth = new Date();
        sinceMonth.setMonth(sinceMonth.getMonth() - 1);
        const u = await this.userModel.findById(userId).select('referralCode').lean();
        const code = u?.referralCode;
        const [totals, daySum, weekSum, monthSum, salesCount] = await Promise.all([
            this.commissionModel.aggregate([
                { $match: { beneficiaryUserId: uid, incomeCategory: { $in: ['active', 'passive'] } } },
                {
                    $group: {
                        _id: null,
                        active: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] } },
                        passive: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] } },
                    },
                },
            ]),
            this.commissionModel.aggregate([
                {
                    $match: {
                        beneficiaryUserId: uid,
                        incomeCategory: { $in: ['active', 'passive'] },
                        createdAt: { $gte: sinceDay },
                    },
                },
                { $group: { _id: null, t: { $sum: '$amount' } } },
            ]),
            this.commissionModel.aggregate([
                {
                    $match: {
                        beneficiaryUserId: uid,
                        incomeCategory: { $in: ['active', 'passive'] },
                        createdAt: { $gte: sinceWeek },
                    },
                },
                { $group: { _id: null, t: { $sum: '$amount' } } },
            ]),
            this.commissionModel.aggregate([
                {
                    $match: {
                        beneficiaryUserId: uid,
                        incomeCategory: { $in: ['active', 'passive'] },
                        createdAt: { $gte: sinceMonth },
                    },
                },
                { $group: { _id: null, t: { $sum: '$amount' } } },
            ]),
            code
                ? this.purchaseModel.countDocuments({
                    couponUsed: code,
                    paymentStatus: app_constants_1.PaymentStatus.COMPLETED,
                })
                : Promise.resolve(0),
        ]);
        const t = totals[0] || { active: 0, passive: 0 };
        return {
            totalActive: t.active,
            totalPassive: t.passive,
            lifetimeEarnings: t.active + t.passive,
            todayIncome: daySum[0]?.t || 0,
            weeklyIncome: weekSum[0]?.t || 0,
            monthlyIncome: monthSum[0]?.t || 0,
            totalCourseSales: salesCount,
        };
    }
    periodStart(period) {
        if (period === 'overall')
            return null;
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        if (period === 'weekly') {
            const day = d.getDay();
            const diff = day === 0 ? 6 : day - 1;
            d.setDate(d.getDate() - diff);
        }
        else if (period === 'monthly') {
            d.setDate(1);
        }
        return d;
    }
    async leaderboard(period, limit = 10) {
        const since = this.periodStart(period);
        if (period === 'overall') {
            const users = await this.userModel
                .find({ role: 'user', $or: [{ activeIncome: { $gt: 0 } }, { passiveIncome: { $gt: 0 } }] })
                .select('name email avatarUrl activeIncome passiveIncome')
                .sort({ activeIncome: -1, passiveIncome: -1 })
                .limit(limit)
                .lean();
            return users.map((u, i) => ({
                rank: i + 1,
                userId: u._id.toString(),
                name: u.name,
                email: u.email,
                avatarUrl: u.avatarUrl,
                activeIncome: u.activeIncome || 0,
                passiveIncome: u.passiveIncome || 0,
                totalEarnings: (u.activeIncome || 0) + (u.passiveIncome || 0),
            }));
        }
        const match = {
            beneficiaryUserId: { $ne: null },
            incomeCategory: { $in: ['active', 'passive'] },
        };
        if (since)
            match.createdAt = { $gte: since };
        const rows = await this.commissionModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$beneficiaryUserId',
                    active: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'active'] }, '$amount', 0] } },
                    passive: { $sum: { $cond: [{ $eq: ['$incomeCategory', 'passive'] }, '$amount', 0] } },
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { total: -1 } },
            { $limit: limit },
        ]);
        const ids = rows.map((r) => r._id);
        const users = await this.userModel
            .find({ _id: { $in: ids } })
            .select('name email avatarUrl activeIncome passiveIncome')
            .lean();
        const byId = new Map(users.map((u) => [u._id.toString(), u]));
        return rows.map((r, i) => {
            const u = byId.get(r._id.toString()) || {};
            return {
                rank: i + 1,
                userId: r._id.toString(),
                name: u.name || 'User',
                email: u.email,
                avatarUrl: u.avatarUrl,
                activeIncome: r.active,
                passiveIncome: r.passive,
                totalEarnings: r.total,
            };
        });
    }
    async incomeUsersList(query) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const filter = { role: 'user' };
        if (query.search) {
            const re = new RegExp(query.search, 'i');
            filter.$or = [{ name: re }, { email: re }, { referralCode: re }];
        }
        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('name email avatarUrl activeIncome passiveIncome referralCode rank createdAt accountActive')
                .sort({ activeIncome: -1, passiveIncome: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            this.userModel.countDocuments(filter),
        ]);
        return {
            items: items.map((u) => ({
                ...u,
                id: u._id.toString(),
                totalIncome: (u.activeIncome || 0) + (u.passiveIncome || 0),
            })),
            total,
            page,
            limit,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __param(1, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map