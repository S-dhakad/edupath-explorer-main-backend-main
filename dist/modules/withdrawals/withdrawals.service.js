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
var WithdrawalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const withdrawal_schema_1 = require("./withdrawal.schema");
const app_constants_1 = require("../../common/constants/app.constants");
const wallet_repository_1 = require("../wallet/wallet.repository");
const mail_service_1 = require("../mail/mail.service");
const user_schema_1 = require("../users/user.schema");
const kyc_service_1 = require("../kyc/kyc.service");
const notifications_service_1 = require("../notifications/notifications.service");
const razorpay_payout_service_1 = require("../payout/razorpay-payout.service");
const mongo_transaction_util_1 = require("../../common/utils/mongo-transaction.util");
const MIN_WITHDRAWAL_AMOUNT = 500;
let WithdrawalsService = WithdrawalsService_1 = class WithdrawalsService {
    constructor(connection, model, userModel, walletRepo, mail, kycService, notifications, razorpayPayout) {
        this.connection = connection;
        this.model = model;
        this.userModel = userModel;
        this.walletRepo = walletRepo;
        this.mail = mail;
        this.kycService = kycService;
        this.notifications = notifications;
        this.razorpayPayout = razorpayPayout;
        this.logger = new common_1.Logger(WithdrawalsService_1.name);
    }
    async request(userId, dto) {
        const amount = Number(dto.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Enter a valid withdrawal amount');
        }
        const kycApproved = await this.kycService.isApproved(userId);
        if (!kycApproved) {
            throw new common_1.BadRequestException('KYC must be approved before you can withdraw');
        }
        if (amount < MIN_WITHDRAWAL_AMOUNT) {
            throw new common_1.BadRequestException(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`);
        }
        const w = await this.walletRepo.ensureWallet(userId);
        if (w.availableBalance < amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: ₹${w.availableBalance}, requested: ₹${amount}`);
        }
        const kycPayout = await this.kycService.getApprovedPayoutDetails(userId);
        const payout = {
            method: dto.method || kycPayout.method,
            accountHolderName: dto.accountHolderName || kycPayout.accountHolderName,
            bankName: dto.bankName || kycPayout.bankName,
            accountNumber: dto.accountNumber || kycPayout.accountNumber,
            ifscCode: dto.ifscCode || kycPayout.ifscCode,
            upiId: dto.upiId,
            paypalEmail: dto.paypalEmail,
        };
        if (payout.method === 'paypal') {
            throw new common_1.BadRequestException('PayPal payouts are not supported. Use bank account from KYC.');
        }
        let created;
        await (0, mongo_transaction_util_1.runOptionalTransaction)(this.connection, async (session) => {
            const txOpts = session ? { session } : {};
            const [doc] = await this.model.create([
                {
                    userId: new mongoose_2.Types.ObjectId(userId),
                    amount,
                    ...payout,
                    status: app_constants_1.WithdrawalStatus.PENDING,
                    payoutProvider: 'razorpayx',
                },
            ], txOpts);
            created = doc;
            try {
                await this.walletRepo.moveAvailableToPending(userId, amount, doc._id.toString(), session);
            }
            catch (walletErr) {
                if (!session) {
                    await this.model.findByIdAndDelete(doc._id);
                }
                throw walletErr;
            }
        });
        const withdrawalId = created._id.toString();
        const u = await this.userModel.findById(userId).select('name email').lean();
        void this.notifications.create(userId, app_constants_1.NotificationType.SYSTEM, 'Withdrawal requested', `Your withdrawal of ₹${amount.toLocaleString('en-IN')} is pending admin review.`, { withdrawalId, amount, status: app_constants_1.WithdrawalStatus.PENDING });
        this.notifications.emitWithdrawalUpdated(userId, {
            withdrawalId,
            amount,
            status: app_constants_1.WithdrawalStatus.PENDING,
        });
        void this.notifications.notifyAdmins(app_constants_1.NotificationType.WITHDRAWAL_REQUESTED, 'New withdrawal request', `${u?.name || 'User'} requested ₹${amount.toLocaleString('en-IN')}.`, { withdrawalId, amount, status: app_constants_1.WithdrawalStatus.PENDING, userId });
        if (u?.email) {
            void this.mail.withdrawalRequested(u.email, u.name || 'User', amount);
        }
        return created;
    }
    listMine(userId) {
        return this.model.find({ userId: new mongoose_2.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
    }
    listAll(filter) {
        const page = filter.page || 1;
        const limit = filter.limit || 20;
        const q = {};
        if (filter.status)
            q.status = filter.status;
        return Promise.all([
            this.model
                .find(q)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'name email')
                .lean(),
            this.model.countDocuments(q),
        ]).then(([items, total]) => ({ items, total, page, limit }));
    }
    async decide(id, approve, adminNote, adminId) {
        const doc = await this.model.findById(id).exec();
        if (!doc)
            throw new common_1.NotFoundException();
        if (doc.status !== app_constants_1.WithdrawalStatus.PENDING) {
            throw new common_1.BadRequestException('Already processed or payout in progress');
        }
        if (!approve) {
            return this.finalizeRejected(doc, adminNote, adminId);
        }
        return this.initiateBankPayout(doc, adminNote, adminId);
    }
    async initiateBankPayout(doc, adminNote, adminId) {
        const id = doc._id.toString();
        const uid = doc.userId.toString();
        const user = await this.userModel.findById(uid).select('name email phone').lean();
        const kyc = await this.kycService.getApprovedPayoutDetails(uid);
        if (!doc.accountNumber || !doc.ifscCode || !doc.accountHolderName) {
            throw new common_1.BadRequestException('Bank details missing on withdrawal');
        }
        let payoutResult;
        try {
            payoutResult = await this.razorpayPayout.sendBankPayout(id, doc.amount, {
                accountHolderName: doc.accountHolderName,
                accountNumber: doc.accountNumber,
                ifscCode: doc.ifscCode,
                email: user?.email,
                phone: user?.phone,
            }, {
                contactId: doc.razorpayContactId || kyc.razorpayContactId,
                fundAccountId: doc.razorpayFundAccountId || kyc.razorpayFundAccountId,
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Payout failed';
            doc.payoutError = msg;
            await doc.save();
            throw new common_1.BadRequestException(msg);
        }
        doc.status = app_constants_1.WithdrawalStatus.PROCESSING;
        doc.adminNote = adminNote;
        doc.payoutInitiatedAt = new Date();
        doc.razorpayContactId = payoutResult.contactId;
        doc.razorpayFundAccountId = payoutResult.fundAccountId;
        doc.razorpayPayoutId = payoutResult.payoutId;
        doc.payoutProviderStatus = payoutResult.status;
        if (adminId)
            doc.processedBy = new mongoose_2.Types.ObjectId(adminId);
        await doc.save();
        await this.kycService.saveRazorpayIds(uid, payoutResult.contactId, payoutResult.fundAccountId);
        void this.notifications.create(uid, app_constants_1.NotificationType.SYSTEM, 'Payout initiated', `₹${doc.amount.toLocaleString('en-IN')} is being transferred to your bank account.`, { withdrawalId: id, amount: doc.amount, status: app_constants_1.WithdrawalStatus.PROCESSING });
        this.notifications.emitWithdrawalUpdated(uid, {
            withdrawalId: id,
            amount: doc.amount,
            status: app_constants_1.WithdrawalStatus.PROCESSING,
            payoutId: payoutResult.payoutId,
        });
        if (payoutResult.mock) {
            setTimeout(() => {
                void this.applyPayoutResult(id, app_constants_1.PayoutProviderStatus.PROCESSED, payoutResult.payoutId);
            }, 1500);
        }
        return doc;
    }
    async finalizeRejected(doc, adminNote, adminId) {
        const id = doc._id.toString();
        const uid = doc.userId.toString();
        await (0, mongo_transaction_util_1.runOptionalTransaction)(this.connection, async (session) => {
            await this.walletRepo.finalizeWithdrawal(uid, doc.amount, id, false, session);
            doc.status = app_constants_1.WithdrawalStatus.REJECTED;
            doc.adminNote = adminNote;
            if (adminId)
                doc.processedBy = new mongoose_2.Types.ObjectId(adminId);
            await doc.save(session ? { session } : {});
        });
        void this.notifyWithdrawalOutcome(uid, id, doc.amount, app_constants_1.WithdrawalStatus.REJECTED, adminNote);
        const u = await this.userModel.findById(uid).select('name email').lean();
        if (u?.email) {
            void this.mail.withdrawalRejected(u.email, u.name || 'User', doc.amount, adminNote);
        }
        return doc;
    }
    async applyPayoutResult(withdrawalId, providerStatus, razorpayPayoutId, failureReason) {
        const doc = await this.model.findById(withdrawalId).exec();
        if (!doc)
            return null;
        if (doc.status !== app_constants_1.WithdrawalStatus.PROCESSING)
            return doc;
        const uid = doc.userId.toString();
        const id = doc._id.toString();
        const normalized = providerStatus.toLowerCase();
        if (normalized === app_constants_1.PayoutProviderStatus.PROCESSED ||
            normalized === 'processed') {
            await (0, mongo_transaction_util_1.runOptionalTransaction)(this.connection, async (session) => {
                await this.walletRepo.finalizeWithdrawal(uid, doc.amount, id, true, session);
                doc.status = app_constants_1.WithdrawalStatus.APPROVED;
                doc.paidAt = new Date();
                doc.payoutProviderStatus = app_constants_1.PayoutProviderStatus.PROCESSED;
                if (razorpayPayoutId)
                    doc.razorpayPayoutId = razorpayPayoutId;
                await doc.save(session ? { session } : {});
            });
            void this.notifyWithdrawalOutcome(uid, id, doc.amount, app_constants_1.WithdrawalStatus.APPROVED, doc.adminNote, doc.razorpayPayoutId);
            const u = await this.userModel.findById(uid).select('name email').lean();
            if (u?.email) {
                void this.mail.withdrawalPaid(u.email, u.name || 'User', doc.amount, doc.adminNote);
            }
            return doc;
        }
        if (normalized === app_constants_1.PayoutProviderStatus.FAILED ||
            normalized === 'failed' ||
            normalized === app_constants_1.PayoutProviderStatus.REVERSED ||
            normalized === 'reversed') {
            doc.payoutError = failureReason || `Payout ${normalized}`;
            doc.payoutProviderStatus = normalized;
            await doc.save();
            return this.finalizeRejected(doc, failureReason || `Bank payout ${normalized}`);
        }
        doc.payoutProviderStatus = normalized;
        if (razorpayPayoutId)
            doc.razorpayPayoutId = razorpayPayoutId;
        await doc.save();
        return doc;
    }
    async syncPayoutStatus(withdrawalId) {
        const doc = await this.model.findById(withdrawalId).exec();
        if (!doc?.razorpayPayoutId)
            throw new common_1.NotFoundException('No payout on this withdrawal');
        const remote = await this.razorpayPayout.fetchPayout(doc.razorpayPayoutId);
        return this.applyPayoutResult(withdrawalId, remote.status, remote.id, remote.failure_reason);
    }
    async handleRazorpayWebhook(body) {
        const event = body?.event || '';
        const entity = body?.payload?.payout?.entity;
        if (!entity?.reference_id) {
            this.logger.warn(`Razorpay webhook ignored: ${event}`);
            return { ok: true };
        }
        const withdrawalId = entity.reference_id;
        if (event === 'payout.processed') {
            await this.applyPayoutResult(withdrawalId, app_constants_1.PayoutProviderStatus.PROCESSED, entity.id);
        }
        else if (event === 'payout.failed' || event === 'payout.reversed') {
            await this.applyPayoutResult(withdrawalId, event === 'payout.reversed' ? app_constants_1.PayoutProviderStatus.REVERSED : app_constants_1.PayoutProviderStatus.FAILED, entity.id, entity.failure_reason);
        }
        else if (event === 'payout.updated' || event === 'payout.initiated') {
            const doc = await this.model.findById(withdrawalId);
            if (doc && entity.status) {
                doc.payoutProviderStatus = entity.status;
                if (entity.id)
                    doc.razorpayPayoutId = entity.id;
                await doc.save();
                const uid = doc.userId.toString();
                this.notifications.emitWithdrawalUpdated(uid, {
                    withdrawalId,
                    amount: doc.amount,
                    status: doc.status,
                    payoutStatus: entity.status,
                });
            }
        }
        return { ok: true };
    }
    notifyWithdrawalOutcome(userId, withdrawalId, amount, status, adminNote, payoutId) {
        const approved = status === app_constants_1.WithdrawalStatus.APPROVED;
        const title = approved ? 'Withdrawal paid' : 'Withdrawal rejected';
        const body = approved
            ? `₹${amount.toLocaleString('en-IN')} has been sent to your bank account.${adminNote ? ` Ref: ${adminNote}` : ''}${payoutId ? ` Payout: ${payoutId}` : ''}`
            : `Your withdrawal of ₹${amount.toLocaleString('en-IN')} was rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`;
        void this.notifications.create(userId, approved ? app_constants_1.NotificationType.WITHDRAWAL_APPROVED : app_constants_1.NotificationType.WITHDRAWAL_REJECTED, title, body, { withdrawalId, amount, status, adminNote, payoutId });
        this.notifications.emitWithdrawalUpdated(userId, {
            withdrawalId,
            amount,
            status,
            adminNote,
            payoutId,
        });
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = WithdrawalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        mongoose_2.Model,
        mongoose_2.Model,
        wallet_repository_1.WalletRepository,
        mail_service_1.MailService,
        kyc_service_1.KycService,
        notifications_service_1.NotificationsService,
        razorpay_payout_service_1.RazorpayPayoutService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map