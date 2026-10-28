import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { WalletRepository } from './wallet.repository';
import { WalletTransactionType } from '../../common/constants/app.constants';
import { runOptionalTransaction } from '../../common/utils/mongo-transaction.util';

@Injectable()
export class WalletService {
  constructor(
    private readonly repo: WalletRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getOrCreate(userId: string) {
    return this.repo.ensureWallet(userId);
  }

  getWallet(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async creditAffiliate(
    userId: string,
    amount: number,
    incomeType: 'active' | 'passive',
    ctx: { purchaseId: string; meta?: Record<string, unknown> },
  ) {
    const type =
      incomeType === 'active'
        ? WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE
        : WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE;
    await runOptionalTransaction(this.connection, async (session) => {
      await this.repo.adjustAvailable(userId, amount, type, { purchaseId: ctx.purchaseId, meta: ctx.meta }, session);
    });
  }

  async listForUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.repo.listTransactions(userId, page, limit),
      this.repo.countTransactions(userId),
    ]);
    return { items, total, page, limit };
  }
}
