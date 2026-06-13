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
import { CreateGuestPlanCheckoutDto } from './dto/create-guest-plan-checkout.dto';
import { AdminCreatePlanSaleDto } from './dto/admin-create-plan-sale.dto';
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

  /** Price breakdown for plan checkout (no GST — total equals discounted subtotal). */
  async quoteCheckout(planId: string, promoCode?: string, buyerUserId?: string) {
    const plan = await this.planModel.findById(planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');
    const pricing = await this.resolveCheckoutPricing(plan, promoCode, buyerUserId);
    const tax = 0;
    const settings = await this.settingsService.getGlobal();
    let commissionBase = pricing.finalSubtotal;
    if (pricing.promoOwner) {
      commissionBase = await this.resolvePlanSaleCommissionBase(pricing.promoOwner, plan as any);
    }
    const commissionPreview = this.buildCommissionPreview(
      pricing.finalSubtotal,
      commissionBase,
      pricing.promoOwner,
      settings.couponOwnerPercent,
      settings.directParentPercent,
      settings.platformPercent,
    );
    return {
      planId,
      planName: plan.name,
      originalPrice: plan.price,
      promoPrice: (plan as any).promoPrice ?? null,
      listPrice: plan.price,
      memberPromoDiscountPercent: settings.memberPromoBuyerDiscountPercent,
      ...pricing,
      tax,
      total: pricing.finalSubtotal,
      commissionPreview,
    };
  }

  async publicQuoteCheckout(planId: string, promoCode: string) {
    const promo = promoCode?.trim()?.toUpperCase();
    if (!promo) throw new BadRequestException('Promo code is required');
    await this.resolvePromoSeller(promo);
    return this.quoteCheckout(planId, promo);
  }

  async adminQuoteCheckout(planId: string, promoCode: string) {
    return this.publicQuoteCheckout(planId, promoCode);
  }

  /** Admin records an offline plan sale (cash, UPI, etc.) — no Razorpay. */
  async adminCreateOfflinePlanSale(adminUserId: string, dto: AdminCreatePlanSaleDto) {
    const plan = await this.planModel.findById(dto.planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');

    const promo = dto.promoCode?.trim()?.toUpperCase();
    if (!promo) throw new BadRequestException('Promo code is required');
    const { sellerOid } = await this.resolvePromoSeller(promo);
    const pricing = await this.resolvePlanPricing(plan, promo);
    const email = dto.email.trim().toLowerCase();

    const pay = await this.paymentModel.create({
      payerUserId: sellerOid,
      planId: new Types.ObjectId(dto.planId),
      amount: pricing.finalSubtotal,
      currency: 'INR',
      couponCode: promo,
      provider: 'manual',
      status: PaymentStatus.COMPLETED,
      externalId: `${dto.paymentMethod}_${Date.now()}`,
      providerPayload: {
        checkoutKind: 'admin_offline',
        adminUserId,
        paymentMethod: dto.paymentMethod,
        paymentReference: dto.paymentReference?.trim() || null,
        adminNote: dto.adminNote?.trim() || null,
        sellerId: sellerOid.toString(),
        affiliateSellerId: null,
        fullName: dto.fullName.trim(),
        email,
        dateOfBirth: dto.dateOfBirth,
        contactNumber: dto.contactNumber,
        promoCode: promo,
        planId: dto.planId,
      },
    });

    const result = await this.completeSaleByPaymentId(pay._id.toString());
    const noteParts = [
      dto.adminNote?.trim(),
      dto.paymentReference?.trim() ? `Payment ref: ${dto.paymentReference.trim()}` : null,
      `Offline: ${dto.paymentMethod}`,
    ].filter(Boolean);
    if (noteParts.length && result.sale?._id) {
      await this.saleModel.findByIdAndUpdate(result.sale._id, {
        adminNote: noteParts.join(' · '),
      });
    }
    return result;
  }

  /** Available higher tiers for the logged-in member. */
  async getUpgradeOptions(buyerUserId: string) {
    const buyer = await this.usersService.findById(buyerUserId);
    if (!buyer?.accountActive || !buyer.planId) {
      return {
        currentPlan: null,
        upgrades: [] as Array<Record<string, unknown>>,
        message: 'No active membership plan. Purchase a plan first.',
      };
    }

    const currentPlan = await this.plansService.findById(buyer.planId.toString());
    if (!currentPlan) {
      return { currentPlan: null, upgrades: [], message: 'Current plan not found.' };
    }

    const currentRank = await this.plansService.getTierRank((currentPlan as any).tierId);
    const credit = await this.getPlanCreditForUser(buyerUserId, currentPlan as any);
    const activePlans = await this.plansService.findActive();

    let uplinePromoCode = null;
    if (buyer.referredBy) {
      const uplineUser = await this.usersService.findById(buyer.referredBy.toString());
      if (uplineUser) {
        uplinePromoCode = (uplineUser as any).referralCode || null;
      }
    }

    const upgrades = await Promise.all(
      activePlans.map(async (target) => {
        const targetRank = await this.plansService.getTierRank((target as any).tierId);
        if (targetRank <= currentRank) return null;
        
        const baseTargetPrice = (target as any).promoPrice ?? target.price;
        return {
          planId: (target as any)._id.toString(),
          tierId: (target as any).tierId,
          name: target.name,
          price: target.price,
          promoPrice: (target as any).promoPrice ?? null,
          targetPrice: baseTargetPrice,
          upgradeCredit: credit,
          upgradeTotal: baseTargetPrice,
          features: target.features ?? [],
        };
      }),
    );



    return {
      currentPlan: {
        planId: (currentPlan as any)._id.toString(),
        tierId: (currentPlan as any).tierId,
        name: currentPlan.name,
        price: currentPlan.price,
        promoPrice: (currentPlan as any).promoPrice ?? null,
        credit,
      },
      upgrades: upgrades.filter(Boolean),
      uplinePromoCode,
    };
  }

  private async getPlanCreditForUser(
    userId: string,
    currentPlan: { _id?: Types.ObjectId; price: number; promoPrice?: number },
  ): Promise<number> {
    const paidSale = await this.saleModel
      .findOne({
        buyerUserId: new Types.ObjectId(userId),
        planId: currentPlan._id,
        status: PlanSaleStatus.PAID,
      })
      .sort({ createdAt: -1 })
      .lean();

    if (paidSale?.paymentId) {
      const pay = await this.paymentModel.findById(paidSale.paymentId).select('amount').lean();
      if (pay?.amount != null && pay.amount > 0) return pay.amount;
    }

    if (currentPlan.promoPrice != null && currentPlan.promoPrice < currentPlan.price) {
      return currentPlan.promoPrice;
    }
    return currentPlan.price;
  }

  private async resolveCheckoutPricing(
    targetPlan: { _id?: Types.ObjectId; price: number; promoPrice?: number; name?: string; tierId?: string },
    promoCode?: string,
    buyerUserId?: string,
  ) {
    const basePricing = await this.resolvePlanPricing(targetPlan, promoCode);
    const targetPrice = basePricing.finalSubtotal;

    if (!buyerUserId) {
      return {
        ...basePricing,
        targetPrice,
        upgradeCredit: 0,
        isUpgrade: false,
        samePlan: false,
        isDowngrade: false,
        currentPlan: null,
      };
    }

    const buyer = await this.usersService.findById(buyerUserId);
    if (!buyer?.accountActive || !buyer.planId) {
      return {
        ...basePricing,
        targetPrice,
        upgradeCredit: 0,
        isUpgrade: false,
        samePlan: false,
        isDowngrade: false,
        currentPlan: null,
      };
    }

    const currentPlan = await this.plansService.findById(buyer.planId.toString());
    if (!currentPlan) {
      return {
        ...basePricing,
        targetPrice,
        upgradeCredit: 0,
        isUpgrade: false,
        samePlan: false,
        isDowngrade: false,
        currentPlan: null,
      };
    }

    const currentOid = (currentPlan as any)._id?.toString();
    const targetOid = (targetPlan as any)._id?.toString();
    if (currentOid && targetOid && currentOid === targetOid) {
      return {
        ...basePricing,
        targetPrice,
        upgradeCredit: 0,
        isUpgrade: false,
        samePlan: true,
        isDowngrade: false,
        currentPlan: { id: currentOid, name: currentPlan.name, tierId: (currentPlan as any).tierId },
      };
    }

    const currentRank = await this.plansService.getTierRank((currentPlan as any).tierId);
    const targetRank = await this.plansService.getTierRank(targetPlan.tierId);
    if (targetRank <= currentRank) {
      return {
        ...basePricing,
        targetPrice,
        upgradeCredit: 0,
        isUpgrade: false,
        samePlan: false,
        isDowngrade: true,
        currentPlan: { id: currentOid, name: currentPlan.name, tierId: (currentPlan as any).tierId },
      };
    }

    const hasReferralPromo = Boolean(promoCode?.trim());
    const listPrice = targetPlan.price;
    let upgradeTargetPrice = basePricing.finalSubtotal;
    let promoDiscount = basePricing.discountAmount;

    // Match upgrade plan page: charge member promo price (no extra credit subtraction).
    if (!hasReferralPromo) {
      const planPromo =
        targetPlan.promoPrice != null && targetPlan.promoPrice < listPrice
          ? targetPlan.promoPrice
          : listPrice;
      upgradeTargetPrice = planPromo;
      promoDiscount = Math.max(0, listPrice - planPromo);
    }

    const finalSubtotal = upgradeTargetPrice;
    const promoLabel = hasReferralPromo
      ? basePricing.discountLabel
      : promoDiscount > 0
        ? `Member promo price ₹${upgradeTargetPrice.toLocaleString('en-IN')}`
        : undefined;

    return {
      ...basePricing,
      subtotal: listPrice,
      discountAmount: promoDiscount,
      finalSubtotal,
      targetPrice: upgradeTargetPrice,
      upgradeCredit: 0,
      isUpgrade: true,
      samePlan: false,
      isDowngrade: false,
      currentPlan: {
        id: currentOid,
        name: currentPlan.name,
        tierId: (currentPlan as any).tierId,
      },
      discountLabel: promoLabel,
    };
  }

  private assertMemberPromoOwnerActive(owner: UserDocument) {
    if (!owner.accountActive) {
      throw new BadRequestException('This member promo code is not active yet.');
    }
  }

  private memberReferralPricing(
    plan: { price: number; promoPrice?: number },
    subtotal: number,
    trimmed: string,
    owner: UserDocument,
  ) {
    let finalSubtotal: number;
    let discountAmount: number;
    let discountLabel: string;

    if (plan.promoPrice != null && plan.promoPrice < subtotal) {
      finalSubtotal = plan.promoPrice;
      discountAmount = subtotal - finalSubtotal;
      discountLabel = `Member promo price ₹${plan.promoPrice.toLocaleString('en-IN')}`;
    } else {
      return null;
    }

    return {
      subtotal,
      discountAmount,
      finalSubtotal,
      promoCode: trimmed,
      kind: 'member_referral' as const,
      referrerName: owner.name,
      promoOwner: owner,
      discountLabel,
      attributionOnly: false,
    };
  }

  private async memberReferralPricingWithSettings(
    plan: { price: number; promoPrice?: number },
    subtotal: number,
    trimmed: string,
    owner: UserDocument,
  ) {
    const fixed = this.memberReferralPricing(plan, subtotal, trimmed, owner);
    if (fixed) return fixed;

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

  /** Member promo/list price used for commission tier rules. */
  private planEffectivePrice(plan: { price: number; promoPrice?: number | null }): number {
    if (plan.promoPrice != null && plan.promoPrice < plan.price) return plan.promoPrice;
    return plan.price;
  }

  /**
   * Commission pool for plan sales:
   * - Sold plan is higher than seller's active plan → seller's plan price
   * - Sold plan is same or lower tier → sold plan price
   */
  async resolvePlanSaleCommissionBase(
    seller: UserDocument,
    soldPlan: { price: number; promoPrice?: number | null; tierId?: string | null },
  ): Promise<number> {
    const soldBase = this.planEffectivePrice(soldPlan);

    if (!seller.accountActive || !seller.planId) {
      return soldBase;
    }

    const sellerPlan = await this.plansService.findById(seller.planId.toString());
    if (!sellerPlan) return soldBase;

    const sellerBase = this.planEffectivePrice(sellerPlan as any);
    const sellerRank = await this.plansService.getTierRank((sellerPlan as any).tierId);
    const soldRank = await this.plansService.getTierRank(soldPlan.tierId);

    if (soldRank > sellerRank) {
      return sellerBase;
    }
    return soldBase;
  }

  private buildCommissionPreview(
    paidAmount: number,
    commissionBase: number,
    promoOwner: UserDocument | null | undefined,
    ownerPct: number,
    parentPct: number,
    platPct: number,
  ) {
    const pool = commissionBase > 0 ? commissionBase : paidAmount;
    const sellerShare = round2((pool * ownerPct) / 100);
    let platformShare = round2((pool * platPct) / 100);
    let parentShare = round2((pool * parentPct) / 100);
    const surplus = Math.max(0, paidAmount - pool);
    platformShare = round2(platformShare + surplus);
    const parentId = promoOwner?.referredBy ? (promoOwner.referredBy as Types.ObjectId).toString() : null;
    if (!parentId) {
      platformShare = round2(platformShare + parentShare);
      parentShare = 0;
    }
    return {
      paidAmount,
      commissionBase: pool,
      cappedToSellerPlan: pool < paidAmount,
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

  /**
   * Resolve pricing for a plan checkout.
   * - Admin coupon codes: apply % or fixed discount off `plan.price`.
   * - Member referral codes: use the plan's fixed `promoPrice` (if set), else
   *   fall back to the global `memberPromoBuyerDiscountPercent` setting.
   */
  private async resolvePlanPricing(
    plan: { price: number; promoPrice?: number },
    promoCode?: string,
  ) {
    const subtotal = plan.price;
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

    // Member referral codes first — avoids admin coupon rows shadowing user promo codes.
    const owner = await this.usersService.findByReferralCode(trimmed);
    if (owner) {
      this.assertMemberPromoOwnerActive(owner);
      return this.memberReferralPricingWithSettings(plan, subtotal, trimmed, owner);
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

    throw new BadRequestException('Invalid promo / referral code');
  }

  private async resolvePromoSeller(promoRaw?: string) {
    const promo = promoRaw?.trim()?.toUpperCase();
    if (!promo) throw new BadRequestException('Promo code is required');
    const owner = await this.usersService.findByReferralCode(promo);
    if (!owner) throw new BadRequestException('Invalid promo / referral code');
    this.assertMemberPromoOwnerActive(owner);
    return { promo, sellerOid: (owner as any)._id as Types.ObjectId, owner };
  }

  private async initiateDeferredPlanCheckout(opts: {
    checkoutKind: 'affiliate' | 'guest';
    affiliateSellerId?: string;
    sellerOid: Types.ObjectId;
    planId: string;
    fullName: string;
    email: string;
    dateOfBirth: string;
    contactNumber: string;
    promoCode?: string;
  }) {
    const plan = await this.planModel.findById(opts.planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');

    const email = opts.email.trim().toLowerCase();
    const promo = opts.promoCode?.trim()?.toUpperCase();
    const pricing = await this.resolvePlanPricing(plan, promo);

    const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(
      opts.sellerOid.toString(),
      pricing.finalSubtotal,
      { planId: opts.planId, couponCode: promo },
    );

    const payment = paymentOrder.payment as any;
    await this.paymentModel.findByIdAndUpdate(payment._id, {
      providerPayload: {
        checkoutKind: opts.checkoutKind,
        affiliateSellerId: opts.affiliateSellerId ?? null,
        sellerId: opts.sellerOid.toString(),
        fullName: opts.fullName.trim(),
        email,
        dateOfBirth: opts.dateOfBirth,
        contactNumber: opts.contactNumber,
        promoCode: promo ?? null,
        planId: opts.planId,
      },
    });

    return this.checkoutResponse(null, plan, paymentOrder, email, pricing);
  }

  private async createSaleFromPaymentPayload(pay: PaymentDocument) {
    const payload = pay.providerPayload as Record<string, unknown> | undefined;
    if (!payload?.email || !payload?.planId) {
      throw new BadRequestException('Checkout session expired. Please try again.');
    }

    const email = String(payload.email).trim().toLowerCase();
    const planId = String(payload.planId);
    const plan = await this.planModel.findById(planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');

    return this.saleModel.create({
      sellerId: new Types.ObjectId(String(payload.sellerId)),
      buyerUserId: null,
      planId: new Types.ObjectId(planId),
      fullName: String(payload.fullName),
      email,
      age: 0,
      dateOfBirth: new Date(String(payload.dateOfBirth)),
      contactNumber: String(payload.contactNumber),
      promoCode: payload.promoCode ? String(payload.promoCode) : undefined,
      status: PlanSaleStatus.PENDING_PAYMENT,
      paymentId: pay._id,
    });
  }

  /** Affiliate checkout: nothing persisted until Razorpay payment succeeds. */
  async initiateAffiliateCheckout(sellerId: string, dto: CreatePlanSaleDto) {
    const plan = await this.planModel.findById(dto.planId).lean();
    if (!plan) throw new NotFoundException('Plan not found');

    let sellerOid = new Types.ObjectId(sellerId);
    const promo = dto.promoCode?.trim()?.toUpperCase();
    if (promo) {
      const resolved = await this.resolvePromoSeller(promo);
      sellerOid = resolved.sellerOid;
    }

    return this.initiateDeferredPlanCheckout({
      checkoutKind: 'affiliate',
      affiliateSellerId: sellerId,
      sellerOid,
      planId: dto.planId,
      fullName: dto.fullName,
      email: dto.email,
      dateOfBirth: dto.dateOfBirth,
      contactNumber: dto.contactNumber,
      promoCode: promo,
    });
  }

  /** Public buy-plan: guest purchases for self with required promo code. */
  async initiateGuestCheckout(dto: CreateGuestPlanCheckoutDto) {
    const { promo, sellerOid } = await this.resolvePromoSeller(dto.promoCode);
    return this.initiateDeferredPlanCheckout({
      checkoutKind: 'guest',
      sellerOid,
      planId: dto.planId,
      fullName: dto.fullName,
      email: dto.email,
      dateOfBirth: dto.dateOfBirth,
      contactNumber: dto.contactNumber,
      promoCode: promo,
    });
  }

  async finalizeGuestCheckout(paymentId: string) {
    const pay = await this.paymentModel.findById(paymentId).lean();
    const kind = (pay?.providerPayload as any)?.checkoutKind;
    if (!pay || kind !== 'guest') {
      throw new BadRequestException('Invalid guest checkout session');
    }
    return this.completeSaleByPaymentId(paymentId);
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

    let promo = dto.promoCode?.trim()?.toUpperCase();
    if (promo) {
      const validated = await this.usersService.validateReferralCodeForCheckout(promo, buyerUserId);
      const owner = await this.usersService.findByReferralCode(validated.code);
      sellerOid = (owner as any)._id;
    } else if (buyer.referredBy) {
      const uplineUser = await this.usersService.findById(buyer.referredBy.toString());
      if (uplineUser && (uplineUser as any).referralCode) {
        promo = (uplineUser as any).referralCode;
      }
    }

    const existingPaid = await this.saleModel
      .findOne({ buyerUserId: buyerOid, planId: planOid, status: PlanSaleStatus.PAID })
      .lean();
    if (existingPaid) {
      throw new ConflictException('You already have this plan active.');
    }

    const pricing = await this.resolveCheckoutPricing(plan as any, promo, buyerUserId);
    if (pricing.samePlan) {
      throw new ConflictException('You already have this plan active.');
    }
    if (pricing.isDowngrade) {
      throw new BadRequestException(
        'Downgrades are not supported. Choose a higher plan from Upgrade Plan.',
      );
    }

    const fullName = dto.fullName.trim();
    const email = buyer.email;
    const age = buyer.age ?? 0;
    const dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : (buyer.dateOfBirth ?? new Date());
    const contactNumber = (dto.contactNumber || buyer.phone || '').trim();

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
        isUpgrade: pricing.isUpgrade,
        upgradedFromPlanId: pricing.isUpgrade ? (buyer.planId as Types.ObjectId) : null,
      });
    } else {
      sale.fullName = fullName;
      sale.age = age;
      sale.dateOfBirth = dateOfBirth;
      sale.contactNumber = contactNumber;
      sale.promoCode = promo;
      sale.sellerId = sellerOid;
      sale.isUpgrade = pricing.isUpgrade;
      sale.upgradedFromPlanId = pricing.isUpgrade ? (buyer.planId as Types.ObjectId) : null;
      await sale.save();
    }

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
  async finalizeCheckout(actorUserId: string, paymentId: string, saleId?: string) {
    if (saleId) {
      const sale = await this.saleModel
        .findById(saleId)
        .select('+buyerTempPassword')
        .populate('planId', 'name price')
        .exec();
      if (!sale) throw new NotFoundException('Sale not found');

      const isBuyer = sale.buyerUserId?.toString() === actorUserId;
      const isSeller = sale.sellerId.toString() === actorUserId;
      if (!isBuyer && !isSeller) {
        throw new BadRequestException('Not allowed to finalize this sale');
      }
      if (sale.paymentId?.toString() !== paymentId) {
        throw new BadRequestException('Payment does not match this sale');
      }
    } else {
      // Logged-in self checkout (upgrade / buy for self) creates the sale up front.
      const selfSale = await this.saleModel
        .findOne({
          paymentId: new Types.ObjectId(paymentId),
          buyerUserId: new Types.ObjectId(actorUserId),
        })
        .exec();
      if (selfSale) {
        return this.completeSaleByPaymentId(paymentId);
      }

      const pay = await this.paymentModel.findById(paymentId).lean();
      const payload = pay?.providerPayload as Record<string, unknown> | undefined;
      if (!payload || payload.checkoutKind !== 'affiliate') {
        throw new BadRequestException('Checkout session not found');
      }
      const affiliateSellerId = String(payload.affiliateSellerId ?? '');
      const sellerId = String(payload.sellerId ?? '');
      if (affiliateSellerId !== actorUserId && sellerId !== actorUserId) {
        throw new BadRequestException('Not allowed to finalize this checkout');
      }
    }

    return this.completeSaleByPaymentId(paymentId);
  }

  async completeSaleByPaymentId(paymentId: string) {
    const pay = await this.paymentModel.findById(paymentId).exec();
    if (!pay) throw new BadRequestException('Payment not found');

    const key = this.config.get<string>('razorpay.keyId');
    const paymentMock = this.config.get<boolean>('razorpay.paymentMock') === true;
    if (key && pay.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment not completed yet');
    }
    if (!key && paymentMock && pay.status !== PaymentStatus.COMPLETED) {
      await this.paymentModel.findByIdAndUpdate(paymentId, { status: PaymentStatus.COMPLETED }).exec();
      pay.status = PaymentStatus.COMPLETED;
    }
    if (!key && !paymentMock && pay.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env.',
      );
    }

    let sale = await this.saleModel
      .findOne({ paymentId: new Types.ObjectId(paymentId) })
      .select('+buyerTempPassword')
      .populate('planId', 'name price promoPrice tierId')
      .exec();

    if (!sale) {
      sale = await this.createSaleFromPaymentPayload(pay);
      sale = await this.saleModel
        .findById(sale._id)
        .select('+buyerTempPassword')
        .populate('planId', 'name price promoPrice tierId')
        .exec();
    }

    if (!sale) throw new NotFoundException('Plan sale not found for this payment');

    if (sale.status === PlanSaleStatus.PAID) {
      const promo = sale.buyerUserId
        ? await this.usersService.ensureReferralCode(sale.buyerUserId.toString())
        : undefined;
      return {
        alreadyPaid: true,
        sale,
        yourPromoCode: promo,
        message: 'Plan already active.',
        planActive: true,
      };
    }

    if (sale.status === PlanSaleStatus.PAID_PENDING_APPROVAL) {
      return {
        alreadyPendingApproval: true,
        sale,
        message: 'Payment received. Awaiting admin approval to activate the plan.',
        pendingAdminApproval: true,
        planActive: false,
        buyerCredentials: sale.buyerTempPassword
          ? {
              email: sale.email,
              temporaryPassword: sale.buyerTempPassword,
            }
          : undefined,
      };
    }

    if (sale.status === PlanSaleStatus.REJECTED) {
      throw new BadRequestException('This plan sale was rejected by admin.');
    }

    const plan = sale.planId as any;
    const planOid = plan?._id ?? sale.planId;
    let loginPassword = '';
    let buyerId: string;

    if (!sale.buyerUserId) {
      const existing = await this.usersService.findByEmail(sale.email);
      if (existing?.accountActive && existing.planId) {
        throw new ConflictException('Email already registered with an active plan');
      }
      if (existing?.accountActive && !existing.planId) {
        buyerId = existing._id.toString();
        loginPassword = sale.buyerTempPassword || uuidv4().slice(0, 12);
        await this.usersService.activateAccount(buyerId, loginPassword);
        sale.buyerUserId = existing._id as Types.ObjectId;
        sale.buyerTempPassword = loginPassword;
      } else {
        await this.usersService.deleteInactiveUserByEmail(sale.email);

        loginPassword = sale.buyerTempPassword || uuidv4().slice(0, 12);
        const buyer = await this.usersService.create({
          name: sale.fullName,
          email: sale.email,
          password: loginPassword,
          referredBy: sale.sellerId,
          accountActive: true,
          planId: null,
          age: sale.age,
          dateOfBirth: sale.dateOfBirth,
          phone: sale.contactNumber,
        } as any);
        sale.buyerUserId = buyer._id as Types.ObjectId;
        sale.buyerTempPassword = loginPassword;
        buyerId = buyer._id.toString();
      }
    } else {
      buyerId = sale.buyerUserId.toString();
      const buyer = await this.usersService.findById(buyerId);
      if (!buyer?.accountActive) {
        loginPassword = sale.buyerTempPassword || uuidv4().slice(0, 12);
        await this.usersService.activateAccount(buyerId, loginPassword);
        sale.buyerTempPassword = loginPassword;
      }
    }

    await this.usersService.updateProfileAfterPayment(buyerId, {
      name: sale.fullName,
      phone: sale.contactNumber,
      age: sale.age,
      dateOfBirth: sale.dateOfBirth,
    });

    sale.status = PlanSaleStatus.PAID_PENDING_APPROVAL;
    await sale.save();

    void this.mail
      .planSaleAwaitingAdminApproval(
        sale.email,
        sale.fullName,
        plan?.name || 'Plan',
        loginPassword || undefined,
      )
      .catch(() => undefined);

    return {
      sale,
      plan: { _id: planOid, name: plan?.name, price: plan?.price },
      message: `Payment received for "${plan?.name || 'membership'}". The buyer can log in; the plan activates after admin approval.`,
      pendingAdminApproval: true,
      planActive: false,
      accountActive: true,
      credentialsEmailed: true,
      buyerCredentials: sale.buyerTempPassword
        ? {
            email: sale.email,
            temporaryPassword: sale.buyerTempPassword,
            loginUrl: this.config.get<string>('frontendUrl') || 'http://localhost:5173',
          }
        : undefined,
    };
  }

  async adminDecidePlanSale(id: string, approve: boolean, adminNote?: string) {
    const sale = await this.saleModel
      .findById(id)
      .select('+buyerTempPassword')
      .populate('planId', 'name price promoPrice tierId')
      .exec();
    if (!sale) throw new NotFoundException('Plan sale not found');

    if (sale.status === PlanSaleStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Payment not confirmed yet. Confirm payment first.');
    }
    if (sale.status === PlanSaleStatus.PAID) {
      throw new BadRequestException('Plan is already active');
    }
    if (sale.status === PlanSaleStatus.REJECTED) {
      throw new BadRequestException('Plan sale already rejected');
    }
    if (sale.status !== PlanSaleStatus.PAID_PENDING_APPROVAL) {
      throw new BadRequestException('Invalid plan sale status');
    }

    sale.adminNote = adminNote?.trim() || sale.adminNote;
    if (!approve) {
      sale.status = PlanSaleStatus.REJECTED;
      await sale.save();
      const plan = sale.planId as any;
      void this.mail
        .planSaleRejected(sale.email, sale.fullName, plan?.name || 'Plan', adminNote)
        .catch(() => undefined);
      return { rejected: true, sale, message: 'Plan sale rejected.' };
    }

    return this.activateApprovedPlanSale(sale);
  }

  countPendingApprovals() {
    return this.saleModel.countDocuments({ status: PlanSaleStatus.PAID_PENDING_APPROVAL }).exec();
  }

  findPendingApprovalForBuyer(userId: string) {
    return this.saleModel
      .findOne({
        buyerUserId: new Types.ObjectId(userId),
        status: PlanSaleStatus.PAID_PENDING_APPROVAL,
      })
      .populate('planId', 'name')
      .lean()
      .exec();
  }

  private async activateApprovedPlanSale(sale: PlanSaleDocument) {
    const pay = await this.paymentModel.findById(sale.paymentId).exec();
    if (!pay) throw new BadRequestException('Payment not found for this sale');
    if (pay.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment must be completed before plan activation');
    }

    const plan = sale.planId as any;
    const planOid = plan?._id ?? sale.planId;
    if (!sale.buyerUserId) {
      throw new BadRequestException('Buyer account missing for this sale');
    }
    const buyerId = sale.buyerUserId.toString();
    let loginPassword = sale.buyerTempPassword || '';

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
        const soldPlan = plan as { price: number; promoPrice?: number | null; tierId?: string };
        const commissionBase = await this.resolvePlanSaleCommissionBase(seller as any, soldPlan);
        await this.revenueDistribution.distributePlanSale(
          sale,
          pay.amount,
          seller as any,
          commissionBase,
        );
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
      message: `Plan "${plan?.name || 'membership'}" is now active.`,
      planActive: true,
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
    return this.finalizeCheckout(buyerUserId, dto.paymentId, sale._id.toString());
  }

  private checkoutResponse(
    sale: PlanSaleDocument | null,
    plan: any,
    paymentOrder: any,
    email: string,
    pricing?: Awaited<ReturnType<PlanSalesService['resolvePlanPricing']>>,
  ) {
    const payment = paymentOrder.payment;
    const amountPaise = Math.round((payment.amount ?? plan.price) * 100);
    return {
      sale: sale ?? undefined,
      plan: { _id: plan._id ?? plan, name: plan.name, price: plan.price },
      pricing: pricing
        ? {
            subtotal: pricing.subtotal,
            discountAmount: pricing.discountAmount,
            finalSubtotal: pricing.finalSubtotal,
            targetPrice: (pricing as any).targetPrice,
            upgradeCredit: (pricing as any).upgradeCredit ?? 0,
            isUpgrade: (pricing as any).isUpgrade ?? false,
            currentPlan: (pricing as any).currentPlan ?? null,
            tax: 0,
            total: pricing.finalSubtotal,
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
      message:
        'Proceed to Razorpay payment. Your details are saved only after successful payment.',
    };
  }

  private sellerSaleFilter(sellerId: string, referralCode?: string | null) {
    const or: Record<string, unknown>[] = [{ sellerId: new Types.ObjectId(sellerId) }];
    const code = referralCode?.trim()?.toUpperCase();
    if (code) or.push({ promoCode: code });
    return { $or: or };
  }

  /** One row per buyer — upgrades create a new sale; keep the latest record only. */
  private dedupeSalesByBuyer<T extends { buyerUserId?: unknown; email?: string }>(
    items: T[],
  ): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const s of items) {
      const buyerId =
        s.buyerUserId && typeof s.buyerUserId === 'object' && '_id' in s.buyerUserId
          ? String((s.buyerUserId as { _id: unknown })._id)
          : s.buyerUserId
            ? String(s.buyerUserId)
            : null;
      const key = buyerId ?? s.email?.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
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

    const uniqueItems = this.dedupeSalesByBuyer(items as any[]);

    return uniqueItems.map((s) => ({
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
      password:
        s.status === PlanSaleStatus.PAID || s.status === PlanSaleStatus.PAID_PENDING_APPROVAL
          ? s.buyerTempPassword || null
          : null,
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
        .populate('paymentId', 'amount status provider externalId currency')
        .lean(),
      this.saleModel.countDocuments(q),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }

  async markPaid(id: string, adminNote?: string) {
    const sale = await this.saleModel.findById(id).select('+buyerTempPassword').populate('planId', 'name').exec();
    if (!sale) throw new NotFoundException();
    if (sale.status === PlanSaleStatus.PAID) throw new BadRequestException('Already paid');

    if (!sale.buyerTempPassword) {
      sale.buyerTempPassword = uuidv4().slice(0, 12);
    }
    sale.adminNote = adminNote;
    await sale.save();

    if (sale.paymentId) {
      await this.paymentModel.findByIdAndUpdate(sale.paymentId, { status: PaymentStatus.COMPLETED }).exec();
      return this.completeSaleByPaymentId(sale.paymentId.toString());
    }

    const plan = sale.planId as any;
    const payerUserId = sale.buyerUserId ?? sale.sellerId;
    const pay = await this.paymentModel.create({
      payerUserId,
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
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
