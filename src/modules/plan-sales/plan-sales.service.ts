import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { PlanSale, PlanSaleDocument, PlanSaleStatus } from './plan-sale.schema';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { UsersService } from '../users/users.service';
import { Plan, PlanDocument } from '../plans/plan.schema';
import { PlansService } from '../plans/plans.service';
import { MailService } from '../mail/mail.service';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { PaymentGatewayService } from '../payment/payment-gateway.service';
import { RevenueDistributionService } from '../commission/revenue-distribution.service';
import { PaymentStatus } from '../../common/constants/app.constants';
import { PromoCouponsService } from '../coupons/promo-coupons.service';
import { SettingsService } from '../settings/settings.service';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class PlanSalesService {
  private readonly logger = new Logger(PlanSalesService.name);

  constructor(
    @InjectModel(PlanSale.name) private readonly saleModel: Model<PlanSaleDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => PaymentGatewayService))
    private readonly paymentGateway: PaymentGatewayService,
    @Inject(forwardRef(() => RevenueDistributionService))
    private readonly revenueDistribution: RevenueDistributionService,
    private readonly promoCoupons: PromoCouponsService,
    private readonly settingsService: SettingsService,
  ) {}

  /** Price breakdown for plan checkout (GST 18% on discounted subtotal). */
  async quoteCheckout(planId: string, promoCode?: string) {
    const plan = await this.planModel.findById(planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');
    const pricing = await this.resolvePlanPricing(plan.price, promoCode);
    const tax = Math.round(pricing.finalSubtotal * 0.18);
    const settings = await this.settingsService.getGlobal();
    const commissionPreview = this.buildCommissionPreview(
      pricing.finalSubtotal,
      pricing.promoOwner,
      settings.couponOwnerPercent,
      settings.directParentPercent,
      settings.platformPercent,
    );
    return {
      planId,
      planName: plan.name,
      listPrice: plan.price,
      memberPromoDiscountPercent: settings.memberPromoBuyerDiscountPercent,
      ...pricing,
      tax,
      total: pricing.finalSubtotal + tax,
      commissionPreview,
    };
  }

  private assertMemberPromoOwnerActive(owner: UserDocument) {
    if (!owner.accountActive) {
      throw new BadRequestException('This member promo code is not active yet.');
    }
    if (!(owner as any).planId) {
      throw new BadRequestException('This member must have an active plan before their promo code can be used.');
    }
  }

  private buildCommissionPreview(
    paidAmount: number,
    promoOwner: UserDocument | null | undefined,
    ownerPct: number,
    parentPct: number,
    platPct: number,
  ) {
    const base = paidAmount;
    const sellerShare = round2((base * ownerPct) / 100);
    let platformShare = round2((base * platPct) / 100);
    let parentShare = round2((base * parentPct) / 100);
    const parentId = promoOwner?.referredBy ? (promoOwner.referredBy as Types.ObjectId).toString() : null;
    if (!parentId) {
      platformShare = round2(platformShare + parentShare);
      parentShare = 0;
    }
    return {
      paidAmount: base,
      promoOwnerName: promoOwner?.name,
      promoOwnerId: promoOwner ? (promoOwner as any)._id?.toString() : null,
      uplineId: parentId,
      sellerShare,
      parentShare,
      platformShare,
      sellerPercent: ownerPct,
      parentPercent: parentId ? parentPct : 0,
      platformPercent: platPct + (!parentId ? parentPct : 0),
    };
  }

  private async resolvePlanPricing(planPrice: number, promoCode?: string) {
    const subtotal = planPrice;
    const trimmed = promoCode?.trim()?.toUpperCase();
    if (!trimmed) {
      return {
        subtotal,
        discountAmount: 0,
        finalSubtotal: subtotal,
        promoCode: undefined as string | undefined,
        kind: null as 'admin_coupon' | 'member_referral' | null,
        referrerName: undefined as string | undefined,
        promoOwner: undefined as UserDocument | undefined,
        discountLabel: undefined as string | undefined,
        attributionOnly: false,
      };
    }

    const coupon = await this.promoCoupons.computeDiscount(trimmed, subtotal);
    if (coupon) {
      return {
        subtotal,
        discountAmount: coupon.discountAmount,
        finalSubtotal: coupon.finalSubtotal,
        promoCode: trimmed,
        kind: 'admin_coupon' as const,
        referrerName: undefined,
        promoOwner: undefined,
        discountLabel: coupon.label,
        attributionOnly: false,
      };
    }

    const owner = await this.usersService.findByReferralCode(trimmed);
    if (!owner) throw new BadRequestException('Invalid promo / referral code');
    this.assertMemberPromoOwnerActive(owner);

    const settings = await this.settingsService.getGlobal();
    const pct = Math.min(100, Math.max(0, settings.memberPromoBuyerDiscountPercent ?? 40));
    const discountAmount = Math.round((subtotal * pct) / 100);
    const finalSubtotal = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountAmount,
      finalSubtotal,
      promoCode: trimmed,
      kind: 'member_referral' as const,
      referrerName: owner.name,
      promoOwner: owner,
      discountLabel: `${pct}% member promo`,
      attributionOnly: false,
    };
  }

  /** Affiliate registers buyer → step 2: Razorpay payment on same screen. */
  async initiateAffiliateCheckout(sellerId: string, dto: CreatePlanSaleDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    const plan = await this.planModel.findById(dto.planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');

    let sellerOid = new Types.ObjectId(sellerId);
    const promo = dto.promoCode?.trim()?.toUpperCase();
    if (promo) {
      const owner = await this.usersService.findByReferralCode(promo);
      if (!owner) throw new BadRequestException('Invalid promo / referral code');
      this.assertMemberPromoOwnerActive(owner);
      sellerOid = (owner as any)._id;
    }

    const tempPassword = uuidv4().slice(0, 12);
    const buyer = await this.usersService.createPlanBuyer({
      name: dto.fullName.trim(),
      email,
      password: tempPassword,
      sellerId: sellerOid.toString(),
      planId: dto.planId,
      age: dto.age,
      dateOfBirth: new Date(dto.dateOfBirth),
      phone: dto.contactNumber,
    });

    const sale = await this.saleModel.create({
      sellerId: sellerOid,
      buyerUserId: buyer._id,
      planId: new Types.ObjectId(dto.planId),
      fullName: dto.fullName.trim(),
      email,
      age: dto.age,
      dateOfBirth: new Date(dto.dateOfBirth),
      contactNumber: dto.contactNumber,
      promoCode: promo,
      status: PlanSaleStatus.PENDING_PAYMENT,
      buyerTempPassword: tempPassword,
    });

    const pricing = await this.resolvePlanPricing(plan.price, promo);

    const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(
      buyer._id.toString(),
      pricing.finalSubtotal,
      { planId: dto.planId, couponCode: promo },
    );

    sale.paymentId = (paymentOrder.payment as any)._id;
    await sale.save();

    return this.checkoutResponse(sale, plan, paymentOrder, email, pricing);
  }

  /** Logged-in user buys for self → step 2: payment gateway. */
  async initiateSelfCheckout(buyerUserId: string, dto: PurchasePlanSelfDto) {
    const plan = await this.plansService.resolvePlanOrThrow(dto.planTierId);
    const buyer = await this.usersService.findById(buyerUserId);
    if (!buyer) throw new NotFoundException('User not found');

    const planOid = (plan as any)._id as Types.ObjectId;
    const buyerOid = new Types.ObjectId(buyerUserId);

    let sellerOid: Types.ObjectId = buyer.referredBy
      ? (buyer.referredBy as Types.ObjectId)
      : new Types.ObjectId(this.config.get<string>('platform.userId') || '000000000000000000000000');

    const promo = dto.promoCode?.trim()?.toUpperCase();
    if (promo) {
      const validated = await this.usersService.validateReferralCodeForCheckout(promo, buyerUserId);
      const owner = await this.usersService.findByReferralCode(validated.code);
      sellerOid = (owner as any)._id;
    }

    const existingPaid = await this.saleModel
      .findOne({ buyerUserId: buyerOid, planId: planOid, status: PlanSaleStatus.PAID })
      .lean();
    if (existingPaid) {
      throw new ConflictException('You already have this plan active.');
    }

    const fullName = dto.fullName.trim();
    const email = buyer.email;
    const age = dto.age;
    const dateOfBirth = new Date(dto.dateOfBirth);
    const contactNumber = dto.contactNumber.trim();

    let sale = await this.saleModel
      .findOne({ buyerUserId: buyerOid, planId: planOid, status: PlanSaleStatus.PENDING_PAYMENT })
      .exec();

    if (!sale) {
      sale = await this.saleModel.create({
        sellerId: sellerOid,
        buyerUserId: buyerOid,
        planId: planOid,
        fullName,
        email,
        age,
        dateOfBirth,
        contactNumber,
        promoCode: promo,
        status: PlanSaleStatus.PENDING_PAYMENT,
      });
    } else {
      sale.fullName = fullName;
      sale.age = age;
      sale.dateOfBirth = dateOfBirth;
      sale.contactNumber = contactNumber;
      sale.promoCode = promo;
      sale.sellerId = sellerOid;
      await sale.save();
    }

    const pricing = await this.resolvePlanPricing(plan.price, promo);

    const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(
      buyerUserId,
      pricing.finalSubtotal,
      { planId: planOid.toString(), couponCode: promo },
    );

    sale.paymentId = (paymentOrder.payment as any)._id;
    await sale.save();

    if (promo) {
      await this.usersService.setLockedAffiliateCouponIfUnset(buyerUserId, promo);
    }

    return this.checkoutResponse(sale, plan, paymentOrder, email, pricing);
  }

  /** After Razorpay success (or dev mock): activate buyer, email credentials, promo, commissions. */
  async finalizeCheckout(actorUserId: string, saleId: string, paymentId: string) {
    const sale = await this.saleModel.findById(saleId).select('+buyerTempPassword').populate('planId', 'name price').exec();
    if (!sale) throw new NotFoundException('Sale not found');

    const isBuyer = sale.buyerUserId.toString() === actorUserId;
    const isSeller = sale.sellerId.toString() === actorUserId;
    if (!isBuyer && !isSeller) {
      throw new BadRequestException('Not allowed to finalize this sale');
    }

    if (sale.paymentId?.toString() !== paymentId) {
      throw new BadRequestException('Payment does not match this sale');
    }

    return this.completeSaleByPaymentId(paymentId);
  }

  async completeSaleByPaymentId(paymentId: string) {
    const pay = await this.paymentModel.findById(paymentId).exec();
    if (!pay) throw new BadRequestException('Payment not found');

    const key = this.config.get<string>('razorpay.keyId');
    if (key && pay.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment not completed yet');
    }
    if (!key && pay.status !== PaymentStatus.COMPLETED) {
      await this.paymentModel.findByIdAndUpdate(paymentId, { status: PaymentStatus.COMPLETED }).exec();
      pay.status = PaymentStatus.COMPLETED;
    }

    const sale = await this.saleModel
      .findOne({ paymentId: new Types.ObjectId(paymentId) })
      .select('+buyerTempPassword')
      .populate('planId', 'name price')
      .exec();
    if (!sale) throw new NotFoundException('Plan sale not found for this payment');

    if (sale.status === PlanSaleStatus.PAID) {
      const promo = await this.usersService.ensureReferralCode(sale.buyerUserId.toString());
      return {
        alreadyPaid: true,
        sale,
        yourPromoCode: promo,
        message: 'Plan already active.',
      };
    }

    const plan = sale.planId as any;
    const planOid = plan?._id ?? sale.planId;
    const buyerId = sale.buyerUserId.toString();
    let loginPassword = '';

    const buyer = await this.usersService.findById(buyerId);
    if (!buyer?.accountActive) {
      loginPassword = sale.buyerTempPassword || uuidv4().slice(0, 12);
      await this.usersService.activateAccount(buyerId, loginPassword);
      if (!sale.buyerTempPassword) {
        sale.buyerTempPassword = loginPassword;
      }
    }

    await this.usersService.updateProfileForSelfPlanPurchase(buyerId, {
      name: sale.fullName,
      phone: sale.contactNumber,
      age: sale.age,
      dateOfBirth: sale.dateOfBirth,
      planId: planOid.toString(),
      accountActive: true,
    });

    sale.status = PlanSaleStatus.PAID;
    await sale.save();

    if (sale.promoCode) {
      const planPrice = plan?.price ?? pay.amount;
      const coupon = await this.promoCoupons.computeDiscount(sale.promoCode, planPrice);
      if (coupon) await this.promoCoupons.incrementUsage(sale.promoCode);
    }

    const yourPromoCode = await this.usersService.ensureReferralCode(buyerId);

    const seller = await this.usersService.findById(sale.sellerId.toString());
    if (seller && !sale.commissionsDistributed) {
      try {
        await this.revenueDistribution.distributePlanSale(sale, pay.amount, seller as any);
      } catch (err) {
        this.logger.warn(
          `Plan sale ${sale._id} activated but commission split failed: ${(err as Error).message}`,
        );
      }
    }

    void this.mail
      .planSaleActivated(
        sale.email,
        sale.fullName,
        plan?.name || 'Plan',
        loginPassword,
        yourPromoCode,
      )
      .catch(() => undefined);

    return {
      sale,
      plan: { _id: planOid, name: plan?.name, price: plan?.price },
      message: `Plan "${plan?.name || 'membership'}" is now active. Login details sent to ${sale.email}.`,
      accountActive: true,
      yourPromoCode,
      promoUnlocked: true,
      credentialsEmailed: true,
    };
  }

  /** @deprecated Use initiateAffiliateCheckout + finalizeCheckout */
  async create(sellerId: string, dto: CreatePlanSaleDto) {
    return this.initiateAffiliateCheckout(sellerId, dto);
  }

  /** Back-compat: with paymentId → finalize; without → initiate checkout only */
  async purchaseSelf(buyerUserId: string, dto: PurchasePlanSelfDto) {
    if (!dto.paymentId) {
      return this.initiateSelfCheckout(buyerUserId, dto);
    }
    const sale = await this.saleModel
      .findOne({
        paymentId: new Types.ObjectId(dto.paymentId),
        buyerUserId: new Types.ObjectId(buyerUserId),
      })
      .exec();
    if (!sale) throw new BadRequestException('Sale not found for this payment');
    return this.finalizeCheckout(buyerUserId, sale._id.toString(), dto.paymentId);
  }

  private checkoutResponse(
    sale: PlanSaleDocument,
    plan: any,
    paymentOrder: any,
    email: string,
    pricing?: Awaited<ReturnType<PlanSalesService['resolvePlanPricing']>>,
  ) {
    const payment = paymentOrder.payment;
    const amountPaise = Math.round((payment.amount ?? plan.price) * 100);
    return {
      sale,
      plan: { _id: plan._id ?? plan, name: plan.name, price: plan.price },
      pricing: pricing
        ? {
            subtotal: pricing.subtotal,
            discountAmount: pricing.discountAmount,
            finalSubtotal: pricing.finalSubtotal,
            tax: Math.round(pricing.finalSubtotal * 0.18),
            total: pricing.finalSubtotal + Math.round(pricing.finalSubtotal * 0.18),
            discountLabel: pricing.discountLabel,
            attributionOnly: pricing.attributionOnly,
          }
        : undefined,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        orderId: paymentOrder.orderId,
      },
      razorpay: {
        keyId: paymentOrder.keyId,
        orderId: paymentOrder.orderId,
        amount: amountPaise,
        currency: 'INR',
      },
      buyerEmail: email,
      message: 'Proceed to payment. Account activates automatically after successful payment.',
    };
  }

  private sellerSaleFilter(sellerId: string, referralCode?: string | null) {
    const or: Record<string, unknown>[] = [{ sellerId: new Types.ObjectId(sellerId) }];
    const code = referralCode?.trim()?.toUpperCase();
    if (code) or.push({ promoCode: code });
    return { $or: or };
  }

  async listMine(sellerId: string) {
    const seller = await this.usersService.findById(sellerId);
    const items = await this.saleModel
      .find(this.sellerSaleFilter(sellerId, seller?.referralCode))
      .sort({ createdAt: -1 })
      .select('+buyerTempPassword')
      .populate('planId', 'name price')
      .populate('buyerUserId', 'name email accountActive phone')
      .lean();

    return (items as any[]).map((s) => ({
      _id: s._id,
      fullName: s.fullName,
      email: s.email,
      contactNumber: s.contactNumber,
      age: s.age,
      dateOfBirth: s.dateOfBirth,
      promoCode: s.promoCode,
      status: s.status,
      adminNote: s.adminNote,
      plan: s.planId
        ? { _id: s.planId._id, name: s.planId.name, price: s.planId.price }
        : null,
      buyer: s.buyerUserId
        ? {
            _id: s.buyerUserId._id,
            name: s.buyerUserId.name,
            email: s.buyerUserId.email,
            accountActive: s.buyerUserId.accountActive,
            phone: s.buyerUserId.phone,
          }
        : null,
      password: s.status === PlanSaleStatus.PAID ? null : s.buyerTempPassword || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      source: s.sellerId?.toString() === sellerId ? 'direct_sale' : 'promo_code',
    }));
  }

  listAll(filter: { status?: PlanSaleStatus; page?: number; limit?: number }) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const q: Record<string, unknown> = {};
    if (filter.status) q.status = filter.status;
    return Promise.all([
      this.saleModel
        .find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('planId', 'name price')
        .populate('sellerId', 'name email')
        .populate('buyerUserId', 'name email accountActive')
        .lean(),
      this.saleModel.countDocuments(q),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async markPaid(id: string, adminNote?: string) {
    const sale = await this.saleModel.findById(id).select('+buyerTempPassword').populate('planId', 'name').exec();
    if (!sale) throw new NotFoundException();
    if (sale.status === PlanSaleStatus.PAID) throw new BadRequestException('Already paid');

    if (sale.paymentId) {
      await this.paymentModel.findByIdAndUpdate(sale.paymentId, { status: PaymentStatus.COMPLETED }).exec();
      sale.adminNote = adminNote;
      await sale.save();
      return this.completeSaleByPaymentId(sale.paymentId.toString());
    }

    const tempPassword = sale.buyerTempPassword || uuidv4().slice(0, 12);
    await this.usersService.activateAccount(sale.buyerUserId.toString(), tempPassword);
    sale.buyerTempPassword = tempPassword;
    sale.adminNote = adminNote;
    await sale.save();

    if (!sale.paymentId) {
      const plan = sale.planId as any;
      const pay = await this.paymentModel.create({
        payerUserId: sale.buyerUserId,
        planId: sale.planId,
        amount: plan?.price ?? 0,
        currency: 'INR',
        provider: 'manual',
        status: PaymentStatus.COMPLETED,
        externalId: `manual_${Date.now()}`,
      });
      sale.paymentId = pay._id;
      await sale.save();
      return this.completeSaleByPaymentId(pay._id.toString());
    }

    return this.completeSaleByPaymentId(sale.paymentId.toString());
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
