import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Withdrawal, WithdrawalDocument } from './withdrawal.schema';
import {
  NotificationType,
  PayoutProviderStatus,
  WithdrawalStatus,
} from '../../common/constants/app.constants';
import { WalletRepository } from '../wallet/wallet.repository';
import { MailService } from '../mail/mail.service';
import { User, UserDocument } from '../users/user.schema';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RazorpayPayoutService } from '../payout/razorpay-payout.service';
import { runOptionalTransaction } from '../../common/utils/mongo-transaction.util';

const MIN_WITHDRAWAL_AMOUNT = 500;

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Withdrawal.name) private model: Model<WithdrawalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private walletRepo: WalletRepository,
    private mail: MailService,
    private readonly kycService: KycService,
    private readonly notifications: NotificationsService,
    private readonly razorpayPayout: RazorpayPayoutService,
  ) {}

  async request(userId: string, dto: Partial<Withdrawal>) {
    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Enter a valid withdrawal amount');
    }

    const kycApproved = await this.kycService.isApproved(userId);
    if (!kycApproved) {
      throw new BadRequestException('KYC must be approved before you can withdraw');
    }

    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new BadRequestException(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`);
    }

    const w = await this.walletRepo.ensureWallet(userId);
    if (w.availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₹${w.availableBalance}, requested: ₹${amount}`,
      );
    }

    const kycPayout = await this.kycService.getApprovedPayoutDetails(userId);
    const payout = {
      method: (dto.method as 'bank' | 'upi' | 'paypal') || kycPayout.method,
      accountHolderName: dto.accountHolderName || kycPayout.accountHolderName,
      bankName: dto.bankName || kycPayout.bankName,
      accountNumber: dto.accountNumber || kycPayout.accountNumber,
      ifscCode: dto.ifscCode || kycPayout.ifscCode,
      upiId: dto.upiId,
      paypalEmail: dto.paypalEmail,
    };

    if (payout.method === 'paypal') {
      throw new BadRequestException('PayPal payouts are not supported. Use bank account from KYC.');
    }

    let created!: WithdrawalDocument;
    await runOptionalTransaction(this.connection, async (session) => {
      const txOpts = session ? { session } : {};
      const [doc] = await this.model.create(
        [
          {
            userId: new Types.ObjectId(userId),
            amount,
            ...payout,
            status: WithdrawalStatus.PENDING,
            payoutProvider: 'razorpayx',
          },
        ],
        txOpts,
      );
      created = doc;
      try {
        await this.walletRepo.moveAvailableToPending(
          userId,
          amount,
          doc._id.toString(),
          session,
        );
      } catch (walletErr) {
        if (!session) {
          await this.model.findByIdAndDelete(doc._id);
        }
        throw walletErr;
      }
    });

    const withdrawalId = created._id.toString();
    const u = await this.userModel.findById(userId).select('name email').lean();

    void this.notifications.create(
      userId,
      NotificationType.SYSTEM,
      'Withdrawal requested',
      `Your withdrawal of ₹${amount.toLocaleString('en-IN')} is pending admin review.`,
      { withdrawalId, amount, status: WithdrawalStatus.PENDING },
    );
    this.notifications.emitWithdrawalUpdated(userId, {
      withdrawalId,
      amount,
      status: WithdrawalStatus.PENDING,
    });
    void this.notifications.notifyAdmins(
      NotificationType.WITHDRAWAL_REQUESTED,
      'New withdrawal request',
      `${u?.name || 'User'} requested ₹${amount.toLocaleString('en-IN')}.`,
      { withdrawalId, amount, status: WithdrawalStatus.PENDING, userId },
    );

    if (u?.email) {
      void this.mail.withdrawalRequested(u.email, u.name || 'User', amount);
    }
    return created;
  }

  listMine(userId: string) {
    return this.model.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  }

  listAll(filter: { status?: WithdrawalStatus; page?: number; limit?: number }) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const q: Record<string, unknown> = {};
    if (filter.status) q.status = filter.status;
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

  /** Admin rejects — return funds to available balance. */
  async decide(id: string, approve: boolean, adminNote?: string, adminId?: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException();
    if (doc.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Already processed or payout in progress');
    }

    if (!approve) {
      return this.finalizeRejected(doc, adminNote, adminId);
    }

    return this.initiateBankPayout(doc, adminNote, adminId);
  }

  /** Admin triggers RazorpayX bank transfer. */
  private async initiateBankPayout(
    doc: WithdrawalDocument,
    adminNote?: string,
    adminId?: string,
  ) {
    const id = doc._id.toString();
    const uid = (doc.userId as Types.ObjectId).toString();
    const user = await this.userModel.findById(uid).select('name email phone').lean();
    const kyc = await this.kycService.getApprovedPayoutDetails(uid);

    if (!doc.accountNumber || !doc.ifscCode || !doc.accountHolderName) {
      throw new BadRequestException('Bank details missing on withdrawal');
    }

    let payoutResult;
    try {
      payoutResult = await this.razorpayPayout.sendBankPayout(
        id,
        doc.amount,
        {
          accountHolderName: doc.accountHolderName,
          accountNumber: doc.accountNumber,
          ifscCode: doc.ifscCode,
          email: user?.email,
          phone: (user as { phone?: string })?.phone,
        },
        {
          contactId: doc.razorpayContactId || kyc.razorpayContactId,
          fundAccountId: doc.razorpayFundAccountId || kyc.razorpayFundAccountId,
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payout failed';
      doc.payoutError = msg;
      await doc.save();
      throw new BadRequestException(msg);
    }

    doc.status = WithdrawalStatus.PROCESSING;
    doc.adminNote = adminNote;
    doc.payoutInitiatedAt = new Date();
    doc.razorpayContactId = payoutResult.contactId;
    doc.razorpayFundAccountId = payoutResult.fundAccountId;
    doc.razorpayPayoutId = payoutResult.payoutId;
    doc.payoutProviderStatus = payoutResult.status;
    if (adminId) doc.processedBy = new Types.ObjectId(adminId);
    await doc.save();

    await this.kycService.saveRazorpayIds(
      uid,
      payoutResult.contactId,
      payoutResult.fundAccountId,
    );

    void this.notifications.create(
      uid,
      NotificationType.SYSTEM,
      'Payout initiated',
      `₹${doc.amount.toLocaleString('en-IN')} is being transferred to your bank account.`,
      { withdrawalId: id, amount: doc.amount, status: WithdrawalStatus.PROCESSING },
    );
    this.notifications.emitWithdrawalUpdated(uid, {
      withdrawalId: id,
      amount: doc.amount,
      status: WithdrawalStatus.PROCESSING,
      payoutId: payoutResult.payoutId,
    });

    if (payoutResult.mock) {
      setTimeout(() => {
        void this.applyPayoutResult(id, PayoutProviderStatus.PROCESSED, payoutResult.payoutId);
      }, 1500);
    }

    return doc;
  }

  private async finalizeRejected(
    doc: WithdrawalDocument,
    adminNote?: string,
    adminId?: string,
  ) {
    const id = doc._id.toString();
    const uid = (doc.userId as Types.ObjectId).toString();

    await runOptionalTransaction(this.connection, async (session) => {
      await this.walletRepo.finalizeWithdrawal(uid, doc.amount, id, false, session);
      doc.status = WithdrawalStatus.REJECTED;
      doc.adminNote = adminNote;
      if (adminId) doc.processedBy = new Types.ObjectId(adminId);
      await doc.save(session ? { session } : {});
    });

    void this.notifyWithdrawalOutcome(uid, id, doc.amount, WithdrawalStatus.REJECTED, adminNote);
    const u = await this.userModel.findById(uid).select('name email').lean();
    if (u?.email) {
      void this.mail.withdrawalRejected(u.email, u.name || 'User', doc.amount, adminNote);
    }
    return doc;
  }

  /** Webhook or mock: mark payout processed / failed and update wallet. */
  async applyPayoutResult(
    withdrawalId: string,
    providerStatus: string,
    razorpayPayoutId?: string,
    failureReason?: string,
  ) {
    const doc = await this.model.findById(withdrawalId).exec();
    if (!doc) return null;
    if (doc.status !== WithdrawalStatus.PROCESSING) return doc;

    const uid = (doc.userId as Types.ObjectId).toString();
    const id = doc._id.toString();
    const normalized = providerStatus.toLowerCase();

    if (
      normalized === PayoutProviderStatus.PROCESSED ||
      normalized === 'processed'
    ) {
      await runOptionalTransaction(this.connection, async (session) => {
        await this.walletRepo.finalizeWithdrawal(uid, doc.amount, id, true, session);
        doc.status = WithdrawalStatus.APPROVED;
        doc.paidAt = new Date();
        doc.payoutProviderStatus = PayoutProviderStatus.PROCESSED;
        if (razorpayPayoutId) doc.razorpayPayoutId = razorpayPayoutId;
        await doc.save(session ? { session } : {});
      });

      void this.notifyWithdrawalOutcome(
        uid,
        id,
        doc.amount,
        WithdrawalStatus.APPROVED,
        doc.adminNote,
        doc.razorpayPayoutId,
      );
      const u = await this.userModel.findById(uid).select('name email').lean();
      if (u?.email) {
        void this.mail.withdrawalPaid(u.email, u.name || 'User', doc.amount, doc.adminNote);
      }
      return doc;
    }

    if (
      normalized === PayoutProviderStatus.FAILED ||
      normalized === 'failed' ||
      normalized === PayoutProviderStatus.REVERSED ||
      normalized === 'reversed'
    ) {
      doc.payoutError = failureReason || `Payout ${normalized}`;
      doc.payoutProviderStatus = normalized;
      await doc.save();
      return this.finalizeRejected(doc, failureReason || `Bank payout ${normalized}`);
    }

    doc.payoutProviderStatus = normalized;
    if (razorpayPayoutId) doc.razorpayPayoutId = razorpayPayoutId;
    await doc.save();
    return doc;
  }

  async syncPayoutStatus(withdrawalId: string) {
    const doc = await this.model.findById(withdrawalId).exec();
    if (!doc?.razorpayPayoutId) throw new NotFoundException('No payout on this withdrawal');
    const remote = await this.razorpayPayout.fetchPayout(doc.razorpayPayoutId);
    return this.applyPayoutResult(
      withdrawalId,
      remote.status,
      remote.id,
      remote.failure_reason,
    );
  }

  async handleRazorpayWebhook(body: {
    event?: string;
    payload?: { payout?: { entity?: { id?: string; status?: string; reference_id?: string; failure_reason?: string } } };
  }) {
    const event = body?.event || '';
    const entity = body?.payload?.payout?.entity;
    if (!entity?.reference_id) {
      this.logger.warn(`Razorpay webhook ignored: ${event}`);
      return { ok: true };
    }

    const withdrawalId = entity.reference_id;
    if (event === 'payout.processed') {
      await this.applyPayoutResult(withdrawalId, PayoutProviderStatus.PROCESSED, entity.id);
    } else if (event === 'payout.failed' || event === 'payout.reversed') {
      await this.applyPayoutResult(
        withdrawalId,
        event === 'payout.reversed' ? PayoutProviderStatus.REVERSED : PayoutProviderStatus.FAILED,
        entity.id,
        entity.failure_reason,
      );
    } else if (event === 'payout.updated' || event === 'payout.initiated') {
      const doc = await this.model.findById(withdrawalId);
      if (doc && entity.status) {
        doc.payoutProviderStatus = entity.status;
        if (entity.id) doc.razorpayPayoutId = entity.id;
        await doc.save();
        const uid = (doc.userId as Types.ObjectId).toString();
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

  private notifyWithdrawalOutcome(
    userId: string,
    withdrawalId: string,
    amount: number,
    status: WithdrawalStatus,
    adminNote?: string,
    payoutId?: string,
  ) {
    const approved = status === WithdrawalStatus.APPROVED;
    const title = approved ? 'Withdrawal paid' : 'Withdrawal rejected';
    const body = approved
      ? `₹${amount.toLocaleString('en-IN')} has been sent to your bank account.${adminNote ? ` Ref: ${adminNote}` : ''}${payoutId ? ` Payout: ${payoutId}` : ''}`
      : `Your withdrawal of ₹${amount.toLocaleString('en-IN')} was rejected.${adminNote ? ` Reason: ${adminNote}` : ''}`;

    void this.notifications.create(
      userId,
      approved ? NotificationType.WITHDRAWAL_APPROVED : NotificationType.WITHDRAWAL_REJECTED,
      title,
      body,
      { withdrawalId, amount, status, adminNote, payoutId },
    );
    this.notifications.emitWithdrawalUpdated(userId, {
      withdrawalId,
      amount,
      status,
      adminNote,
      payoutId,
    });
  }
}
