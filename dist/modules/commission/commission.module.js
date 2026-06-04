"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const commission_schema_1 = require("./schemas/commission.schema");
const purchase_schema_1 = require("../purchases/purchase.schema");
const plan_sale_schema_1 = require("../plan-sales/plan-sale.schema");
const user_schema_1 = require("../users/user.schema");
const revenue_distribution_service_1 = require("./revenue-distribution.service");
const wallet_module_1 = require("../wallet/wallet.module");
const settings_module_1 = require("../settings/settings.module");
let CommissionModule = class CommissionModule {
};
exports.CommissionModule = CommissionModule;
exports.CommissionModule = CommissionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
                { name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema },
                { name: plan_sale_schema_1.PlanSale.name, schema: plan_sale_schema_1.PlanSaleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            wallet_module_1.WalletModule,
            settings_module_1.SettingsModule,
        ],
        providers: [revenue_distribution_service_1.RevenueDistributionService],
        exports: [revenue_distribution_service_1.RevenueDistributionService],
    })
], CommissionModule);
//# sourceMappingURL=commission.module.js.map