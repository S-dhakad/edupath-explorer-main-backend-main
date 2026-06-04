"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSalesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const plan_sales_controller_1 = require("./plan-sales.controller");
const plan_sales_service_1 = require("./plan-sales.service");
const plan_sale_schema_1 = require("./plan-sale.schema");
const users_module_1 = require("../users/users.module");
const user_schema_1 = require("../users/user.schema");
const plan_schema_1 = require("../plans/plan.schema");
const plans_module_1 = require("../plans/plans.module");
const payment_schema_1 = require("../payment/schemas/payment.schema");
const payment_module_1 = require("../payment/payment.module");
const commission_module_1 = require("../commission/commission.module");
const promo_coupon_schema_1 = require("../coupons/promo-coupon.schema");
const promo_coupons_service_1 = require("../coupons/promo-coupons.service");
const settings_module_1 = require("../settings/settings.module");
let PlanSalesModule = class PlanSalesModule {
};
exports.PlanSalesModule = PlanSalesModule;
exports.PlanSalesModule = PlanSalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            plans_module_1.PlansModule,
            settings_module_1.SettingsModule,
            (0, common_1.forwardRef)(() => payment_module_1.PaymentModule),
            (0, common_1.forwardRef)(() => commission_module_1.CommissionModule),
            mongoose_1.MongooseModule.forFeature([
                { name: plan_sale_schema_1.PlanSale.name, schema: plan_sale_schema_1.PlanSaleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: plan_schema_1.Plan.name, schema: plan_schema_1.PlanSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: promo_coupon_schema_1.PromoCoupon.name, schema: promo_coupon_schema_1.PromoCouponSchema },
            ]),
        ],
        controllers: [plan_sales_controller_1.PlanSalesController],
        providers: [plan_sales_service_1.PlanSalesService, promo_coupons_service_1.PromoCouponsService],
        exports: [plan_sales_service_1.PlanSalesService],
    })
], PlanSalesModule);
//# sourceMappingURL=plan-sales.module.js.map