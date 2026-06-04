"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const purchase_schema_1 = require("../purchases/purchase.schema");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const user_schema_1 = require("../users/user.schema");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
                { name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        providers: [analytics_service_1.AnalyticsService],
        controllers: [analytics_controller_1.AnalyticsController],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map