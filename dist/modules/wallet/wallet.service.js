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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const wallet_repository_1 = require("./wallet.repository");
const app_constants_1 = require("../../common/constants/app.constants");
let WalletService = class WalletService {
    constructor(repo, connection) {
        this.repo = repo;
        this.connection = connection;
    }
    getOrCreate(userId) {
        return this.repo.ensureWallet(userId);
    }
    getWallet(userId) {
        return this.repo.findByUserId(userId);
    }
    async creditAffiliate(userId, amount, incomeType, ctx) {
        const type = incomeType === 'active'
            ? app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE
            : app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE;
        const session = await this.connection.startSession();
        try {
            await session.withTransaction(async () => {
                await this.repo.adjustAvailable(userId, amount, type, { purchaseId: ctx.purchaseId, meta: ctx.meta }, session);
            });
        }
        finally {
            await session.endSession();
        }
    }
    async listForUser(userId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.repo.listTransactions(userId, page, limit),
            this.repo.countTransactions(userId),
        ]);
        return { items, total, page, limit };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [wallet_repository_1.WalletRepository,
        mongoose_2.Connection])
], WalletService);
//# sourceMappingURL=wallet.service.js.map