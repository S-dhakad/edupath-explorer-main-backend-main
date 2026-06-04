"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const wallet_schema_1 = require("./schemas/wallet.schema");
const wallet_transaction_schema_1 = require("./schemas/wallet-transaction.schema");
const wallet_repository_1 = require("./wallet.repository");
const wallet_service_1 = require("./wallet.service");
const wallet_controller_1 = require("./wallet.controller");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: wallet_schema_1.Wallet.name, schema: wallet_schema_1.WalletSchema },
                { name: wallet_transaction_schema_1.WalletTransaction.name, schema: wallet_transaction_schema_1.WalletTransactionSchema },
            ]),
        ],
        providers: [wallet_repository_1.WalletRepository, wallet_service_1.WalletService],
        controllers: [wallet_controller_1.WalletController],
        exports: [wallet_service_1.WalletService, wallet_repository_1.WalletRepository],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map