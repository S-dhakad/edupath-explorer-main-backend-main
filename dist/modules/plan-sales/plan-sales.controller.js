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
exports.PlanSalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const plan_sales_service_1 = require("./plan-sales.service");
const create_plan_sale_dto_1 = require("./dto/create-plan-sale.dto");
const purchase_plan_self_dto_1 = require("./dto/purchase-plan-self.dto");
const finalize_plan_sale_dto_1 = require("./dto/finalize-plan-sale.dto");
const quote_plan_dto_1 = require("./dto/quote-plan.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const app_constants_1 = require("../../common/constants/app.constants");
const plan_sale_schema_1 = require("./plan-sale.schema");
let PlanSalesController = class PlanSalesController {
    constructor(svc) {
        this.svc = svc;
    }
    quote(dto) {
        return this.svc.quoteCheckout(dto.planId, dto.promoCode);
    }
    create(user, dto) {
        return this.svc.initiateAffiliateCheckout(user._id.toString(), dto);
    }
    checkoutSelf(user, dto) {
        return this.svc.initiateSelfCheckout(user._id.toString(), dto);
    }
    finalize(user, dto) {
        return this.svc.finalizeCheckout(user._id.toString(), dto.saleId, dto.paymentId);
    }
    purchaseSelf(user, dto) {
        return this.svc.purchaseSelf(user._id.toString(), dto);
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
    markPaid(id, body) {
        return this.svc.markPaid(id, body.adminNote);
    }
};
exports.PlanSalesController = PlanSalesController;
__decorate([
    (0, common_1.Post)('quote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quote_plan_dto_1.QuotePlanDto]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "quote", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_plan_sale_dto_1.CreatePlanSaleDto]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('checkout-self'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, purchase_plan_self_dto_1.PurchasePlanSelfDto]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "checkoutSelf", null);
__decorate([
    (0, common_1.Post)('finalize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, finalize_plan_sale_dto_1.FinalizePlanSaleDto]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "finalize", null);
__decorate([
    (0, common_1.Post)('purchase-self'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, purchase_plan_self_dto_1.PurchasePlanSelfDto]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "purchaseSelf", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "mine", null);
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
], PlanSalesController.prototype, "adminList", null);
__decorate([
    (0, common_1.Patch)('admin/:id/paid'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(app_constants_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlanSalesController.prototype, "markPaid", null);
exports.PlanSalesController = PlanSalesController = __decorate([
    (0, swagger_1.ApiTags)('plan-sales'),
    (0, common_1.Controller)('plan-sales'),
    __metadata("design:paramtypes", [plan_sales_service_1.PlanSalesService])
], PlanSalesController);
//# sourceMappingURL=plan-sales.controller.js.map