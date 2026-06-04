"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const purchases_service_1 = require("./purchases.service");
const purchases_controller_1 = require("./purchases.controller");
const purchase_schema_1 = require("./purchase.schema");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const commission_module_1 = require("../commission/commission.module");
const settings_module_1 = require("../settings/settings.module");
const payment_module_1 = require("../payment/payment.module");
const plans_module_1 = require("../plans/plans.module");
const payment_schema_1 = require("../payment/schemas/payment.schema");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
            ]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            courses_module_1.CoursesModule,
            commission_module_1.CommissionModule,
            settings_module_1.SettingsModule,
            (0, common_1.forwardRef)(() => payment_module_1.PaymentModule),
            plans_module_1.PlansModule,
        ],
        controllers: [purchases_controller_1.PurchasesController],
        providers: [purchases_service_1.PurchasesService],
        exports: [purchases_service_1.PurchasesService],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map