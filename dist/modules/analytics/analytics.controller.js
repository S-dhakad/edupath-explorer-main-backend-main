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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const commission_schema_1 = require("../commission/schemas/commission.schema");
let AnalyticsController = class AnalyticsController {
    constructor(analytics, commissionModel) {
        this.analytics = analytics;
        this.commissionModel = commissionModel;
    }
    summary(user) {
        return this.analytics.dashboardSummary(user._id.toString());
    }
    earnings(user, g, days) {
        return this.analytics.earningsSeries(user._id.toString(), g || 'day', parseInt(days || '30', 10));
    }
    async platformRevenue() {
        const agg = await this.commissionModel.aggregate([
            { $match: { incomeCategory: 'platform' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { platformRevenueTotal: agg[0]?.total || 0 };
    }
    leaderboard(period) {
        const p = period || 'monthly';
        if (!['daily', 'weekly', 'monthly', 'overall'].includes(p)) {
            return this.analytics.leaderboard('monthly');
        }
        return this.analytics.leaderboard(p);
    }
    incomeUsers(page, limit, search) {
        return this.analytics.incomeUsersList({
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '50', 10),
            search,
        });
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('me/summary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('me/earnings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('granularity')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "earnings", null);
__decorate([
    (0, common_1.Get)('admin/platform'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "platformRevenue", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "leaderboard", null);
__decorate([
    (0, common_1.Get)('income/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "incomeUsers", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, common_1.Controller)('analytics'),
    __param(1, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        mongoose_2.Model])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map