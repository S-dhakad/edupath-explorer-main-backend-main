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
exports.WithdrawalsController = void 0;
const common_1 = require("@nestjs/common");
const razorpay_payout_service_1 = require("../payout/razorpay-payout.service");
const swagger_1 = require("@nestjs/swagger");
const withdrawals_service_1 = require("./withdrawals.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const app_constants_2 = require("../../common/constants/app.constants");
let WithdrawalsController = class WithdrawalsController {
    constructor(svc, razorpayPayout) {
        this.svc = svc;
        this.razorpayPayout = razorpayPayout;
    }
    request(user, body) {
        return this.svc.request(user._id.toString(), body);
    }
    mine(user) {
        return this.svc.listMine(user._id.toString());
    }
    adminList(status, page, limit) {
        return this.svc.listAll({
            status,
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
        });
    }
    decide(admin, id, body) {
        return this.svc.decide(id, body.approve, body.adminNote, admin._id.toString());
    }
    syncPayout(id) {
        return this.svc.syncPayoutStatus(id);
    }
    async razorpayxWebhook(req, signature, body) {
        const raw = req.rawBody?.toString('utf8') ||
            (typeof body === 'string' ? body : JSON.stringify(body ?? {}));
        if (signature && !this.razorpayPayout.verifyWebhookSignature(raw, signature)) {
            return { ok: false, error: 'invalid signature' };
        }
        return this.svc.handleRazorpayWebhook(body);
    }
};
exports.WithdrawalsController = WithdrawalsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "request", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "adminList", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "decide", null);
__decorate([
    (0, common_1.Post)('admin/:id/sync-payout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WithdrawalsController.prototype, "syncPayout", null);
__decorate([
    (0, common_1.Post)('webhook/razorpayx'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "razorpayxWebhook", null);
exports.WithdrawalsController = WithdrawalsController = __decorate([
    (0, swagger_1.ApiTags)('withdrawals'),
    (0, common_1.Controller)('withdrawals'),
    __metadata("design:paramtypes", [withdrawals_service_1.WithdrawalsService,
        razorpay_payout_service_1.RazorpayPayoutService])
], WithdrawalsController);
//# sourceMappingURL=withdrawals.controller.js.map