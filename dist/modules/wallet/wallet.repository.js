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
exports.WalletRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const wallet_schema_1 = require("./schemas/wallet.schema");
const wallet_transaction_schema_1 = require("./schemas/wallet-transaction.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let WalletRepository = class WalletRepository {
    constructor(walletModel, txModel) {
        this.walletModel = walletModel;
        this.txModel = txModel;
    }
    findByUserId(userId) {
        return this.walletModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
    async ensureWallet(userId, currency = 'INR', session) {
        let w = await this.walletModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .session(session || null)
            .exec();
        if (!w) {
            const arr = await this.walletModel.create([{ userId: new mongoose_2.Types.ObjectId(userId), availableBalance: 0, pendingBalance: 0, currency }], { session });
            w = arr[0];
        }
        return w;
    }
    async adjustAvailable(userId, delta, type, opts, session) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const wallet = await this.ensureWallet(userId, 'INR', session);
        const next = wallet.availableBalance + delta;
        if (next < -0.0001) {
            throw new Error('Insufficient wallet balance');
        }
        wallet.availableBalance = Math.round(next * 100) / 100;
        await wallet.save({ session });
        await this.txModel.create([
            {
                userId: uid,
                purchaseId: opts.purchaseId ? new mongoose_2.Types.ObjectId(opts.purchaseId) : null,
                withdrawalId: opts.withdrawalId ? new mongoose_2.Types.ObjectId(opts.withdrawalId) : null,
                type,
                amount: delta,
                currency: wallet.currency,
                balanceAfter: wallet.availableBalance,
                meta: opts.meta || {},
            },
        ], { session });
        return wallet;
    }
    async moveAvailableToPending(userId, amount, withdrawalId, session) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const wallet = await this.ensureWallet(userId, 'INR', session);
        if (wallet.availableBalance < amount)
            throw new Error('Insufficient balance');
        wallet.availableBalance -= amount;
        wallet.pendingBalance += amount;
        await wallet.save({ session });
        await this.txModel.create([
            {
                userId: uid,
                withdrawalId: new mongoose_2.Types.ObjectId(withdrawalId),
                type: app_constants_1.WalletTransactionType.WITHDRAWAL_PENDING,
                amount: -amount,
                currency: wallet.currency,
                balanceAfter: wallet.availableBalance,
                meta: {},
            },
        ], { session });
        return wallet;
    }
    async finalizeWithdrawal(userId, amount, withdrawalId, approved, session) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const wallet = await this.ensureWallet(userId, 'INR', session);
        if (wallet.pendingBalance < amount)
            throw new Error('Pending balance mismatch');
        wallet.pendingBalance -= amount;
        if (!approved) {
            wallet.availableBalance += amount;
        }
        await wallet.save({ session });
        await this.txModel.create([
            {
                userId: uid,
                withdrawalId: new mongoose_2.Types.ObjectId(withdrawalId),
                type: approved
                    ? app_constants_1.WalletTransactionType.WITHDRAWAL_COMPLETED
                    : app_constants_1.WalletTransactionType.WITHDRAWAL_REJECTED,
                amount: approved ? -amount : 0,
                currency: wallet.currency,
                balanceAfter: wallet.availableBalance,
                meta: { returnedToAvailable: !approved },
            },
        ], { session });
        return wallet;
    }
    listTransactions(userId, page, limit) {
        const skip = (page - 1) * limit;
        return this.txModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }
    countTransactions(userId) {
        return this.txModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }).exec();
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(wallet_schema_1.Wallet.name)),
    __param(1, (0, mongoose_1.InjectModel)(wallet_transaction_schema_1.WalletTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], WalletRepository);
//# sourceMappingURL=wallet.repository.js.map