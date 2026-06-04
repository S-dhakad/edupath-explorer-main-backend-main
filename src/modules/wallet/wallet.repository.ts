import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { WalletTransactionType } from '../../common/constants/app.constants';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name) private txModel: Model<WalletTransactionDocument>,
  ) {}

  findByUserId(userId: string) {
    return this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async ensureWallet(userId: string, currency = 'INR', session?: ClientSession) {
    let w = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .session(session || null)
      .exec();
    if (!w) {
      const arr = await this.walletModel.create(
        [{ userId: new Types.ObjectId(userId), availableBalance: 0, pendingBalance: 0, currency }],
        { session },
      );
      w = arr[0];
    }
    return w;
  }

  async adjustAvailable(
    userId: string,
    delta: number,
    type: WalletTransactionType,
    opts: { purchaseId?: string; withdrawalId?: string; meta?: Record<string, unknown> },
    session?: ClientSession,
  ) {
    const uid = new Types.ObjectId(userId);
    const wallet = await this.ensureWallet(userId, 'INR', session);
    const next = wallet.availableBalance + delta;
    if (next < -0.0001) {
      throw new Error('Insufficient wallet balance');
    }
    wallet.availableBalance = Math.round(next * 100) / 100;
    await wallet.save({ session });
    await this.txModel.create(
      [
        {
          userId: uid,
          purchaseId: opts.purchaseId ? new Types.ObjectId(opts.purchaseId) : null,
          withdrawalId: opts.withdrawalId ? new Types.ObjectId(opts.withdrawalId) : null,
          type,
          amount: delta,
          currency: wallet.currency,
          balanceAfter: wallet.availableBalance,
          meta: opts.meta || {},
        },
      ],
      { session },
    );
    return wallet;
  }

  async moveAvailableToPending(userId: string, amount: number, withdrawalId: string, session?: ClientSession) {
    const uid = new Types.ObjectId(userId);
    const wallet = await this.ensureWallet(userId, 'INR', session);
    if (wallet.availableBalance < amount) throw new Error('Insufficient balance');
    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount;
    await wallet.save({ session });
    await this.txModel.create(
      [
        {
          userId: uid,
          withdrawalId: new Types.ObjectId(withdrawalId),
          type: WalletTransactionType.WITHDRAWAL_PENDING,
          amount: -amount,
          currency: wallet.currency,
          balanceAfter: wallet.availableBalance,
          meta: {},
        },
      ],
      { session },
    );
    return wallet;
  }

  async finalizeWithdrawal(
    userId: string,
    amount: number,
    withdrawalId: string,
    approved: boolean,
    session?: ClientSession,
  ) {
    const uid = new Types.ObjectId(userId);
    const wallet = await this.ensureWallet(userId, 'INR', session);
    if (wallet.pendingBalance < amount) throw new Error('Pending balance mismatch');
    wallet.pendingBalance -= amount;
    if (!approved) {
      wallet.availableBalance += amount;
    }
    await wallet.save({ session });
    await this.txModel.create(
      [
        {
          userId: uid,
          withdrawalId: new Types.ObjectId(withdrawalId),
          type: approved
            ? WalletTransactionType.WITHDRAWAL_COMPLETED
            : WalletTransactionType.WITHDRAWAL_REJECTED,
          amount: approved ? -amount : 0,
          currency: wallet.currency,
          balanceAfter: wallet.availableBalance,
          meta: { returnedToAvailable: !approved },
        },
      ],
      { session },
    );
    return wallet;
  }

  listTransactions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.txModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  countTransactions(userId: string) {
    return this.txModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
  }
}
