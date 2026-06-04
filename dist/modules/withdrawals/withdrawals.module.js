"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const withdrawal_schema_1 = require("./withdrawal.schema");
const withdrawals_service_1 = require("./withdrawals.service");
const withdrawals_controller_1 = require("./withdrawals.controller");
const wallet_module_1 = require("../wallet/wallet.module");
const user_schema_1 = require("../users/user.schema");
const kyc_module_1 = require("../kyc/kyc.module");
const notifications_module_1 = require("../notifications/notifications.module");
const payout_module_1 = require("../payout/payout.module");
let WithdrawalsModule = class WithdrawalsModule {
};
exports.WithdrawalsModule = WithdrawalsModule;
exports.WithdrawalsModule = WithdrawalsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: withdrawal_schema_1.Withdrawal.name, schema: withdrawal_schema_1.WithdrawalSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            wallet_module_1.WalletModule,
            kyc_module_1.KycModule,
            notifications_module_1.NotificationsModule,
            payout_module_1.PayoutModule,
        ],
        providers: [withdrawals_service_1.WithdrawalsService],
        controllers: [withdrawals_controller_1.WithdrawalsController],
        exports: [withdrawals_service_1.WithdrawalsService],
    })
], WithdrawalsModule);
//# sourceMappingURL=withdrawals.module.js.map