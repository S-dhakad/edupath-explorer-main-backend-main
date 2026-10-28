import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from '../purchases/purchase.schema';
import { Commission, CommissionDocument } from './schemas/commission.schema';
import { User, UserDocument } from '../users/user.schema';
import { WalletRepository } from '../wallet/wallet.repository';
import { SettingsService } from '../settings/settings.service';
import { CourseDocument } from '../courses/course.schema';
import { PlanSaleDocument } from '../plan-sales/plan-sale.schema';
import { PlanSale } from '../plan-sales/plan-sale.schema';
import { PaymentStatus, WalletTransactionType } from '../../common/constants/app.constants';
import { runOptionalTransaction } from '../../common/utils/mongo-transaction.util';

@Injectable()
export class RevenueDistributionService {
  private readonly logger = new Logger(RevenueDistributionService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
    @InjectModel(PlanSale.name) private readonly planSaleModel: Model<PlanSaleDocument>,
    @InjectModel(Commission.name) private readonly commissionModel: Model<CommissionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly walletRepo: WalletRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async distributePurchase(
    purchase: PurchaseDocument,
    course: CourseDocument,
    couponOwner: UserDocument,
  ): Promise<void> {
    if (purchase.commissionsDistributed) return;

    const settings = await this.settingsService.getGlobal();
    const total = purchase.amount;
    const ownerPct = settings.couponOwnerPercent;
    const platPct = settings.platformPercent;
    const parentPct = settings.directParentPercent;

    const ownerAmount = round2((total * ownerPct) / 100);
    let platformAmount = round2((total * platPct) / 100);
    let parentAmount = round2((total * parentPct) / 100);

    let parentId = extractIdString(couponOwner.referredBy);
    if (parentId) {
      const parentExists = await this.userModel.exists({ _id: new Types.ObjectId(parentId) });
      if (!parentExists) parentId = null;
    }
    if (!parentId) {
      platformAmount = round2(platformAmount + parentAmount);
      parentAmount = 0;
    }

    const purchaseOid = (purchase as any)._id as Types.ObjectId;
    const purchaseId = purchaseOid.toString();
    const ownerId = (couponOwner as any)._id.toString();

    const commissions: Partial<Commission>[] = [
      {
        purchaseId: purchaseOid,
        beneficiaryUserId: new Types.ObjectId(ownerId),
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
        beneficiaryUserId: new Types.ObjectId(parentId),
        beneficiaryRole: 'direct_parent',
        incomeCategory: 'passive',
        amount: parentAmount,
        currency: purchase.currency || 'INR',
        percentApplied: parentPct,
      });
    }

    await runOptionalTransaction(this.connection, async (session) => {
      await this.commissionModel.insertMany(commissions as Commission[], session ? { session } : undefined);

      await this.walletRepo.adjustAvailable(
        ownerId,
        ownerAmount,
        WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE,
        { purchaseId, meta: { courseId: (course as any)._id?.toString?.() } },
        session,
      );
      await this.userModel.findByIdAndUpdate(
        ownerId,
        { $inc: { activeIncome: ownerAmount } },
        session ? { session } : undefined,
      );

      if (parentId && parentAmount > 0) {
        await this.walletRepo.adjustAvailable(
          parentId,
          parentAmount,
          WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE,
          { purchaseId, meta: { courseId: (course as any)._id?.toString?.() } },
          session,
        );
        await this.userModel.findByIdAndUpdate(
          parentId,
          { $inc: { passiveIncome: parentAmount } },
          session ? { session } : undefined,
        );
      }

      await this.purchaseModel.findByIdAndUpdate(
        purchaseOid,
        {
          commissionsDistributed: true,
          paymentStatus: PaymentStatus.COMPLETED,
        },
        session ? { session } : undefined,
      );
    });

    this.logger.log(`Distributed commissions for purchase ${purchaseId}`);
  }

  /**
   * Plan membership sale: 70% seller (promo owner), 10% parent, 20% platform.
   * `commissionBase` caps the split pool when a member sells a higher-tier plan than their own.
   * Any amount paid above `commissionBase` is credited to the platform share.
   */
  async distributePlanSale(
    sale: PlanSaleDocument,
    paidAmount: number,
    seller: UserDocument,
    commissionBase?: number,
  ): Promise<void> {
    if (sale.commissionsDistributed) return;

    const settings = await this.settingsService.getGlobal();
    const ownerPct = settings.couponOwnerPercent;
    const platPct = settings.platformPercent;
    const parentPct = settings.directParentPercent;

    const pool = commissionBase != null && commissionBase > 0 ? commissionBase : paidAmount;
    const ownerAmount = round2((pool * ownerPct) / 100);
    let platformAmount = round2((pool * platPct) / 100);
    let parentAmount = round2((pool * parentPct) / 100);
    platformAmount = round2(platformAmount + Math.max(0, paidAmount - pool));

    let parentId = extractIdString(seller.referredBy);
    if (parentId) {
      const parentExists = await this.userModel.exists({ _id: new Types.ObjectId(parentId) });
      if (!parentExists) parentId = null;
    }
    if (!parentId) {
      platformAmount = round2(platformAmount + parentAmount);
      parentAmount = 0;
    }

    const saleOid = (sale as any)._id as Types.ObjectId;
    const saleId = saleOid.toString();
    const ownerId = (seller as any)._id.toString();

    const commissions: Partial<Commission>[] = [
      {
        planSaleId: saleOid,
        purchaseId: null,
        beneficiaryUserId: new Types.ObjectId(ownerId),
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
        beneficiaryUserId: new Types.ObjectId(parentId),
        beneficiaryRole: 'direct_parent',
        incomeCategory: 'passive',
        amount: parentAmount,
        currency: 'INR',
        percentApplied: parentPct,
      });
    }

    /* Standalone MongoDB (no replica set) does not support transactions — use sequential writes. */
    await this.commissionModel.insertMany(commissions as Commission[]);

    await this.walletRepo.adjustAvailable(
      ownerId,
      ownerAmount,
      WalletTransactionType.AFFILIATE_COMMISSION_ACTIVE,
      { meta: { planSaleId: saleId } },
    );
    await this.userModel.findByIdAndUpdate(ownerId, { $inc: { activeIncome: ownerAmount } }).exec();

    if (parentId && parentAmount > 0) {
      await this.walletRepo.adjustAvailable(
        parentId,
        parentAmount,
        WalletTransactionType.AFFILIATE_COMMISSION_PASSIVE,
        { meta: { planSaleId: saleId } },
      );
      await this.userModel.findByIdAndUpdate(parentId, { $inc: { passiveIncome: parentAmount } }).exec();
    }

    await this.planSaleModel.findByIdAndUpdate(saleOid, { commissionsDistributed: true }).exec();

    this.logger.log(`Distributed plan sale commissions for ${saleId}`);
  }

  async distributePlatformOnly(purchase: PurchaseDocument): Promise<void> {
    if (purchase.commissionsDistributed) return;
    const purchaseOid = (purchase as any)._id as Types.ObjectId;
    await runOptionalTransaction(this.connection, async (session) => {
      await this.commissionModel.create(
        [
          {
            purchaseId: purchaseOid,
            beneficiaryUserId: null,
            beneficiaryRole: 'platform',
            incomeCategory: 'platform',
            amount: purchase.amount,
            currency: purchase.currency || 'INR',
            percentApplied: 100,
          },
        ],
        session ? { session } : undefined,
      );
      await this.purchaseModel.findByIdAndUpdate(
        purchaseOid,
        { commissionsDistributed: true, paymentStatus: PaymentStatus.COMPLETED },
        session ? { session } : undefined,
      );
    });
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function extractIdString(val: any): string | null {
  if (!val) return null;
  if (val instanceof Types.ObjectId) return val.toString();
  if (typeof val === 'object' && val._id) return val._id.toString();
  const str = String(val);
  return Types.ObjectId.isValid(str) ? str : null;
}
