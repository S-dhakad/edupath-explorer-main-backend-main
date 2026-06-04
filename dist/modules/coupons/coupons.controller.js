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
exports.CouponsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const purchases_service_1 = require("../purchases/purchases.service");
const config_1 = require("@nestjs/config");
const promo_coupons_service_1 = require("./promo-coupons.service");
const users_service_1 = require("../users/users.service");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
let CouponsController = class CouponsController {
    constructor(purchases, config, promoCoupons, usersService) {
        this.purchases = purchases;
        this.config = config;
        this.promoCoupons = promoCoupons;
        this.usersService = usersService;
    }
    validate(user, body) {
        return this.usersService.validateReferralCodeForCheckout(body.code, user._id.toString());
    }
    async me(user) {
        const base = this.config.get('frontendUrl') || 'http://localhost:5173';
        const unlocked = Boolean(user.accountActive && user.planId);
        if (!unlocked) {
            return {
                code: null,
                unlocked: false,
                referralLink: null,
                qrData: null,
                message: 'Your promo code will be available after your plan is active.',
            };
        }
        const code = user.referralCode || (await this.usersService.ensureReferralCode(user._id.toString()));
        return {
            code,
            unlocked: true,
            referralLink: `${base}/signup?ref=${code}`,
            qrData: `${base}/signup?ref=${code}`,
        };
    }
    performance(user, page, limit) {
        return this.purchases.listAffiliateSales(user.referralCode, {
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
        });
    }
    adminList() {
        return this.promoCoupons.findAll();
    }
    adminCreate(body) {
        return this.promoCoupons.create(body);
    }
    adminUpdate(id, body) {
        return this.promoCoupons.update(id, body);
    }
    adminDelete(id) {
        return this.promoCoupons.remove(id);
    }
};
exports.CouponsController = CouponsController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('me/performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "performance", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "adminList", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "adminCreate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "adminUpdate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "adminDelete", null);
exports.CouponsController = CouponsController = __decorate([
    (0, swagger_1.ApiTags)('coupons'),
    (0, common_1.Controller)('coupons'),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService,
        config_1.ConfigService,
        promo_coupons_service_1.PromoCouponsService,
        users_service_1.UsersService])
], CouponsController);
//# sourceMappingURL=coupons.controller.js.map