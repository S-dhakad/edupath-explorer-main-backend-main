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
var RevenueDistributionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueDistributionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const purchase_schema_1 = require("../purchases/purchase.schema");
const commission_schema_1 = require("./schemas/commission.schema");
const user_schema_1 = require("../users/user.schema");
const wallet_repository_1 = require("../wallet/wallet.repository");
const settings_service_1 = require("../settings/settings.service");
const plan_sale_schema_1 = require("../plan-sales/plan-sale.schema");
const app_constants_1 = require("../../common/constants/app.constants");
let RevenueDistributionService = RevenueDistributionService_1 = class RevenueDistributionService {
    constructor(connection, purchaseModel, planSaleModel, commissionModel, userModel, walletRepo, settingsService) {
        this.connection = connection;
        this.purchaseModel = purchaseModel;
        this.planSaleModel = planSaleModel;
        this.commissionModel = commissionModel;
        this.userModel = userModel;
        this.walletRepo = walletRepo;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(RevenueDistributionService_1.name);
    }
    async distributePurchase(purchase, course, couponOwner) {
        if (purchase.commissionsDistributed)
            return;
        const settings = await this.settingsService.getGlobal();
        const total = purchase.amount;
        const ownerPct = settings.couponOwnerPercent;
        const platPct = settings.platformPercent;
        const parentPct = settings.directParentPercent;
        const ownerAmount = round2((total * ownerPct) / 100);
        let platformAmount = round2((total * platPct) / 100);
        let parentAmount = round2((total * parentPct) / 100);
        const parentId = couponOwner.referredBy ? couponOwner.referredBy.toString() : null;
        if (!parentId) {
            platformAmount = round2(platformAmount + parentAmount);
            parentAmount = 0;
        }
        const purchaseOid = purchase._id;
        const purchaseId = purchaseOid.toString();
        const ownerId = couponOwner._id.toString();
        const commissions = [
            {
                purchaseId: purchaseOid,
                beneficiaryUserId: new mongoose_2.Types.ObjectId(ownerId),
                beneficiaryRole: 'coupon_owner',
                incomeCategory: 'active',
                amount: ownerAmount,
                currency: purchase.currency || 'INR',
                percentApplied: ownerPct,
            },
            {
                purchaseId: purchaseOid,
                beneficiaryUserId: null,
                beneficiaryRole: 'platform',
                incomeCategory: 'platform',
                amount: platformAmount,
                currency: purchase.currency || 'INR',
                percentApplied: platPct + (!parentId ? parentPct : 0),
            },
        ];
        if (parentId && parentAmount > 0) {
            commissions.push({
                purchaseId: purchaseOid,
                beneficiaryUserId: new mongoose_2.Types.ObjectId(parentId),
                beneficiaryRole: 'direct_parent',
                incomeCategory: 'passive',
                amount: parentAmount,
                currency: purchase.currency || 'INR',
                percentApplied: parentPct,
            });
        }
        const session = await this.connection.startSession();
        try {
            await session.withTransaction(async () => {
                await this.commissionModel.insertMany(commissions, { session });
                await this.walletRepo.adjustAvailable(ownerId, ownerAmount, app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE, { purchaseId, meta: { courseId: course._id?.toString?.() } }, session);
                await this.userModel.findByIdAndUpdate(ownerId, { $inc: { activeIncome: ownerAmount } }, { session });
                if (parentId && parentAmount > 0) {
                    await this.walletRepo.adjustAvailable(parentId, parentAmount, app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE, { purchaseId, meta: { courseId: course._id?.toString?.() } }, session);
                    await this.userModel.findByIdAndUpdate(parentId, { $inc: { passiveIncome: parentAmount } }, { session });
                }
                await this.purchaseModel.findByIdAndUpdate(purchaseOid, {
                    commissionsDistributed: true,
                    paymentStatus: app_constants_1.PaymentStatus.COMPLETED,
                }, { session });
            });
        }
        finally {
            await session.endSession();
        }
        this.logger.log(`Distributed commissions for purchase ${purchaseId}`);
    }
    async distributePlanSale(sale, amount, seller) {
        if (sale.commissionsDistributed)
            return;
        const settings = await this.settingsService.getGlobal();
        const ownerPct = settings.couponOwnerPercent;
        const platPct = settings.platformPercent;
        const parentPct = settings.directParentPercent;
        const ownerAmount = round2((amount * ownerPct) / 100);
        let platformAmount = round2((amount * platPct) / 100);
        let parentAmount = round2((amount * parentPct) / 100);
        const parentId = seller.referredBy ? seller.referredBy.toString() : null;
        if (!parentId) {
            platformAmount = round2(platformAmount + parentAmount);
            parentAmount = 0;
        }
        const saleOid = sale._id;
        const saleId = saleOid.toString();
        const ownerId = seller._id.toString();
        const commissions = [
            {
                planSaleId: saleOid,
                purchaseId: null,
                beneficiaryUserId: new mongoose_2.Types.ObjectId(ownerId),
                beneficiaryRole: 'coupon_owner',
                incomeCategory: 'active',
                amount: ownerAmount,
                currency: 'INR',
                percentApplied: ownerPct,
            },
            {
                planSaleId: saleOid,
                purchaseId: null,
                beneficiaryUserId: null,
                beneficiaryRole: 'platform',
                incomeCategory: 'platform',
                amount: platformAmount,
                currency: 'INR',
                percentApplied: platPct + (!parentId ? parentPct : 0),
            },
        ];
        if (parentId && parentAmount > 0) {
            commissions.push({
                planSaleId: saleOid,
                purchaseId: null,
                beneficiaryUserId: new mongoose_2.Types.ObjectId(parentId),
                beneficiaryRole: 'direct_parent',
                incomeCategory: 'passive',
                amount: parentAmount,
                currency: 'INR',
                percentApplied: parentPct,
            });
        }
        await this.commissionModel.insertMany(commissions);
        await this.walletRepo.adjustAvailable(ownerId, ownerAmount, app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE, { meta: { planSaleId: saleId } });
        await this.userModel.findByIdAndUpdate(ownerId, { $inc: { activeIncome: ownerAmount } }).exec();
        if (parentId && parentAmount > 0) {
            await this.walletRepo.adjustAvailable(parentId, parentAmount, app_constants_1.WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE, { meta: { planSaleId: saleId } });
            await this.userModel.findByIdAndUpdate(parentId, { $inc: { passiveIncome: parentAmount } }).exec();
        }
        await this.planSaleModel.findByIdAndUpdate(saleOid, { commissionsDistributed: true }).exec();
        this.logger.log(`Distributed plan sale commissions for ${saleId}`);
    }
    async distributePlatformOnly(purchase) {
        if (purchase.commissionsDistributed)
            return;
        const purchaseOid = purchase._id;
        const session = await this.connection.startSession();
        try {
            await session.withTransaction(async () => {
                await this.commissionModel.create([
                    {
                        purchaseId: purchaseOid,
                        beneficiaryUserId: null,
                        beneficiaryRole: 'platform',
                        incomeCategory: 'platform',
                        amount: purchase.amount,
                        currency: purchase.currency || 'INR',
                        percentApplied: 100,
                    },
                ], { session });
                await this.purchaseModel.findByIdAndUpdate(purchaseOid, { commissionsDistributed: true, paymentStatus: app_constants_1.PaymentStatus.COMPLETED }, { session });
            });
        }
        finally {
            await session.endSession();
        }
    }
};
exports.RevenueDistributionService = RevenueDistributionService;
exports.RevenueDistributionService = RevenueDistributionService = RevenueDistributionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __param(2, (0, mongoose_1.InjectModel)(plan_sale_schema_1.PlanSale.name)),
    __param(3, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        wallet_repository_1.WalletRepository,
        settings_service_1.SettingsService])
], RevenueDistributionService);
function round2(n) {
    return Math.round(n * 100) / 100;
}
//# sourceMappingURL=revenue-distribution.service.js.map