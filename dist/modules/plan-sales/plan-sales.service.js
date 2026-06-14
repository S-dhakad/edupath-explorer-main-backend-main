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
var PlanSalesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const plan_sale_schema_1 = require("./plan-sale.schema");
const users_service_1 = require("../users/users.service");
const plan_schema_1 = require("../plans/plan.schema");
const plans_service_1 = require("../plans/plans.service");
const mail_service_1 = require("../mail/mail.service");
const payment_schema_1 = require("../payment/schemas/payment.schema");
const payment_gateway_service_1 = require("../payment/payment-gateway.service");
const revenue_distribution_service_1 = require("../commission/revenue-distribution.service");
const app_constants_1 = require("../../common/constants/app.constants");
const promo_coupons_service_1 = require("../coupons/promo-coupons.service");
const settings_service_1 = require("../settings/settings.service");
let PlanSalesService = PlanSalesService_1 = class PlanSalesService {
    constructor(saleModel, planModel, paymentModel, usersService, plansService, mail, config, paymentGateway, revenueDistribution, promoCoupons, settingsService) {
        this.saleModel = saleModel;
        this.planModel = planModel;
        this.paymentModel = paymentModel;
        this.usersService = usersService;
        this.plansService = plansService;
        this.mail = mail;
        this.config = config;
        this.paymentGateway = paymentGateway;
        this.revenueDistribution = revenueDistribution;
        this.promoCoupons = promoCoupons;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(PlanSalesService_1.name);
    }
    async quoteCheckout(planId, promoCode, buyerUserId) {
        const plan = await this.planModel.findById(planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const pricing = await this.resolveCheckoutPricing(plan, promoCode, buyerUserId);
        const tax = 0;
        const settings = await this.settingsService.getGlobal();
        let commissionBase = pricing.finalSubtotal;
        if (pricing.promoOwner) {
            commissionBase = await this.resolvePlanSaleCommissionBase(pricing.promoOwner, plan);
        }
        const commissionPreview = this.buildCommissionPreview(pricing.finalSubtotal, commissionBase, pricing.promoOwner, settings.couponOwnerPercent, settings.directParentPercent, settings.platformPercent);
        return {
            planId,
            planName: plan.name,
            originalPrice: plan.price,
            promoPrice: plan.promoPrice ?? null,
            listPrice: plan.price,
            memberPromoDiscountPercent: settings.memberPromoBuyerDiscountPercent,
            ...pricing,
            tax,
            total: pricing.finalSubtotal,
            commissionPreview,
        };
    }
    async publicQuoteCheckout(planId, promoCode) {
        const promo = promoCode?.trim()?.toUpperCase();
        if (!promo)
            throw new common_1.BadRequestException('Promo code is required');
        await this.resolvePromoSeller(promo);
        return this.quoteCheckout(planId, promo);
    }
    async adminQuoteCheckout(planId, promoCode) {
        return this.publicQuoteCheckout(planId, promoCode);
    }
    async adminCreateOfflinePlanSale(adminUserId, dto) {
        const plan = await this.planModel.findById(dto.planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const promo = dto.promoCode?.trim()?.toUpperCase();
        if (!promo)
            throw new common_1.BadRequestException('Promo code is required');
        const { sellerOid } = await this.resolvePromoSeller(promo);
        const pricing = await this.resolvePlanPricing(plan, promo);
        const email = dto.email.trim().toLowerCase();
        const pay = await this.paymentModel.create({
            payerUserId: sellerOid,
            planId: new mongoose_2.Types.ObjectId(dto.planId),
            amount: pricing.finalSubtotal,
            currency: 'INR',
            couponCode: promo,
            provider: 'manual',
            status: app_constants_1.PaymentStatus.COMPLETED,
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
    async getUpgradeOptions(buyerUserId) {
        const buyer = await this.usersService.findById(buyerUserId);
        if (!buyer?.accountActive || !buyer.planId) {
            return {
                currentPlan: null,
                upgrades: [],
                message: 'No active membership plan. Purchase a plan first.',
            };
        }
        const currentPlan = await this.plansService.findById(buyer.planId.toString());
        if (!currentPlan) {
            return { currentPlan: null, upgrades: [], message: 'Current plan not found.' };
        }
        const currentRank = await this.plansService.getTierRank(currentPlan.tierId);
        const credit = await this.getPlanCreditForUser(buyerUserId, currentPlan);
        const activePlans = await this.plansService.findActive();
        let uplinePromoCode = null;
        if (buyer.referredBy) {
            const uplineUser = await this.usersService.findById(buyer.referredBy.toString());
            if (uplineUser) {
                uplinePromoCode = uplineUser.referralCode || null;
            }
        }
        const upgrades = await Promise.all(activePlans.map(async (target) => {
            const targetRank = await this.plansService.getTierRank(target.tierId);
            if (targetRank <= currentRank)
                return null;
            const baseTargetPrice = target.promoPrice ?? target.price;
            return {
                planId: target._id.toString(),
                tierId: target.tierId,
                name: target.name,
                price: target.price,
                promoPrice: target.promoPrice ?? null,
                targetPrice: baseTargetPrice,
                upgradeCredit: credit,
                upgradeTotal: baseTargetPrice,
                features: target.features ?? [],
            };
        }));
        return {
            currentPlan: {
                planId: currentPlan._id.toString(),
                tierId: currentPlan.tierId,
                name: currentPlan.name,
                price: currentPlan.price,
                promoPrice: currentPlan.promoPrice ?? null,
                credit,
            },
            upgrades: upgrades.filter(Boolean),
            uplinePromoCode,
        };
    }
    async getPlanCreditForUser(userId, currentPlan) {
        const paidSale = await this.saleModel
            .findOne({
            buyerUserId: new mongoose_2.Types.ObjectId(userId),
            planId: currentPlan._id,
            status: plan_sale_schema_1.PlanSaleStatus.PAID,
        })
            .sort({ createdAt: -1 })
            .lean();
        if (paidSale?.paymentId) {
            const pay = await this.paymentModel.findById(paidSale.paymentId).select('amount').lean();
            if (pay?.amount != null && pay.amount > 0)
                return pay.amount;
        }
        if (currentPlan.promoPrice != null && currentPlan.promoPrice < currentPlan.price) {
            return currentPlan.promoPrice;
        }
        return currentPlan.price;
    }
    async resolveCheckoutPricing(targetPlan, promoCode, buyerUserId) {
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
        const currentOid = currentPlan._id?.toString();
        const targetOid = targetPlan._id?.toString();
        if (currentOid && targetOid && currentOid === targetOid) {
            return {
                ...basePricing,
                targetPrice,
                upgradeCredit: 0,
                isUpgrade: false,
                samePlan: true,
                isDowngrade: false,
                currentPlan: { id: currentOid, name: currentPlan.name, tierId: currentPlan.tierId },
            };
        }
        const currentRank = await this.plansService.getTierRank(currentPlan.tierId);
        const targetRank = await this.plansService.getTierRank(targetPlan.tierId);
        if (targetRank <= currentRank) {
            return {
                ...basePricing,
                targetPrice,
                upgradeCredit: 0,
                isUpgrade: false,
                samePlan: false,
                isDowngrade: true,
                currentPlan: { id: currentOid, name: currentPlan.name, tierId: currentPlan.tierId },
            };
        }
        const hasReferralPromo = Boolean(promoCode?.trim());
        const listPrice = targetPlan.price;
        let upgradeTargetPrice = basePricing.finalSubtotal;
        let promoDiscount = basePricing.discountAmount;
        if (!hasReferralPromo) {
            const planPromo = targetPlan.promoPrice != null && targetPlan.promoPrice < listPrice
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
                tierId: currentPlan.tierId,
            },
            discountLabel: promoLabel,
        };
    }
    assertMemberPromoOwnerActive(owner) {
        if (!owner.accountActive) {
            throw new common_1.BadRequestException('This member promo code is not active yet.');
        }
    }
    memberReferralPricing(plan, subtotal, trimmed, owner) {
        let finalSubtotal;
        let discountAmount;
        let discountLabel;
        if (plan.promoPrice != null && plan.promoPrice < subtotal) {
            finalSubtotal = plan.promoPrice;
            discountAmount = subtotal - finalSubtotal;
            discountLabel = `Member promo price ₹${plan.promoPrice.toLocaleString('en-IN')}`;
        }
        else {
            return null;
        }
        return {
            subtotal,
            discountAmount,
            finalSubtotal,
            promoCode: trimmed,
            kind: 'member_referral',
            referrerName: owner.name,
            promoOwner: owner,
            discountLabel,
            attributionOnly: false,
        };
    }
    async memberReferralPricingWithSettings(plan, subtotal, trimmed, owner) {
        const fixed = this.memberReferralPricing(plan, subtotal, trimmed, owner);
        if (fixed)
            return fixed;
        const settings = await this.settingsService.getGlobal();
        const pct = Math.min(100, Math.max(0, settings.memberPromoBuyerDiscountPercent ?? 40));
        const discountAmount = Math.round((subtotal * pct) / 100);
        const finalSubtotal = Math.max(0, subtotal - discountAmount);
        return {
            subtotal,
            discountAmount,
            finalSubtotal,
            promoCode: trimmed,
            kind: 'member_referral',
            referrerName: owner.name,
            promoOwner: owner,
            discountLabel: `${pct}% member promo`,
            attributionOnly: false,
        };
    }
    planEffectivePrice(plan) {
        if (plan.promoPrice != null && plan.promoPrice < plan.price)
            return plan.promoPrice;
        return plan.price;
    }
    async resolvePlanSaleCommissionBase(seller, soldPlan) {
        const soldBase = this.planEffectivePrice(soldPlan);
        if (!seller.accountActive || !seller.planId) {
            return soldBase;
        }
        const sellerPlan = await this.plansService.findById(seller.planId.toString());
        if (!sellerPlan)
            return soldBase;
        const sellerBase = this.planEffectivePrice(sellerPlan);
        const sellerRank = await this.plansService.getTierRank(sellerPlan.tierId);
        const soldRank = await this.plansService.getTierRank(soldPlan.tierId);
        if (soldRank > sellerRank) {
            return sellerBase;
        }
        return soldBase;
    }
    buildCommissionPreview(paidAmount, commissionBase, promoOwner, ownerPct, parentPct, platPct) {
        const pool = commissionBase > 0 ? commissionBase : paidAmount;
        const sellerShare = round2((pool * ownerPct) / 100);
        let platformShare = round2((pool * platPct) / 100);
        let parentShare = round2((pool * parentPct) / 100);
        const surplus = Math.max(0, paidAmount - pool);
        platformShare = round2(platformShare + surplus);
        const parentId = promoOwner?.referredBy ? promoOwner.referredBy.toString() : null;
        if (!parentId) {
            platformShare = round2(platformShare + parentShare);
            parentShare = 0;
        }
        return {
            paidAmount,
            commissionBase: pool,
            cappedToSellerPlan: pool < paidAmount,
            promoOwnerName: promoOwner?.name,
            promoOwnerId: promoOwner ? promoOwner._id?.toString() : null,
            uplineId: parentId,
            sellerShare,
            parentShare,
            platformShare,
            sellerPercent: ownerPct,
            parentPercent: parentId ? parentPct : 0,
            platformPercent: platPct + (!parentId ? parentPct : 0),
        };
    }
    async resolvePlanPricing(plan, promoCode) {
        const subtotal = plan.price;
        const trimmed = promoCode?.trim()?.toUpperCase();
        if (!trimmed) {
            return {
                subtotal,
                discountAmount: 0,
                finalSubtotal: subtotal,
                promoCode: undefined,
                kind: null,
                referrerName: undefined,
                promoOwner: undefined,
                discountLabel: undefined,
                attributionOnly: false,
            };
        }
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
                kind: 'admin_coupon',
                referrerName: undefined,
                promoOwner: undefined,
                discountLabel: coupon.label,
                attributionOnly: false,
            };
        }
        throw new common_1.BadRequestException('Invalid promo / referral code');
    }
    async resolvePromoSeller(promoRaw) {
        const promo = promoRaw?.trim()?.toUpperCase();
        if (!promo)
            throw new common_1.BadRequestException('Promo code is required');
        const owner = await this.usersService.findByReferralCode(promo);
        if (!owner)
            throw new common_1.BadRequestException('Invalid promo / referral code');
        this.assertMemberPromoOwnerActive(owner);
        return { promo, sellerOid: owner._id, owner };
    }
    async initiateDeferredPlanCheckout(opts) {
        const plan = await this.planModel.findById(opts.planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const email = opts.email.trim().toLowerCase();
        const promo = opts.promoCode?.trim()?.toUpperCase();
        const pricing = await this.resolvePlanPricing(plan, promo);
        const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(opts.sellerOid.toString(), pricing.finalSubtotal, { planId: opts.planId, couponCode: promo });
        const payment = paymentOrder.payment;
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
    async createSaleFromPaymentPayload(pay) {
        const payload = pay.providerPayload;
        if (!payload?.email || !payload?.planId) {
            throw new common_1.BadRequestException('Checkout session expired. Please try again.');
        }
        const email = String(payload.email).trim().toLowerCase();
        const planId = String(payload.planId);
        const plan = await this.planModel.findById(planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return this.saleModel.create({
            sellerId: new mongoose_2.Types.ObjectId(String(payload.sellerId)),
            buyerUserId: null,
            planId: new mongoose_2.Types.ObjectId(planId),
            fullName: String(payload.fullName),
            email,
            age: 0,
            dateOfBirth: new Date(String(payload.dateOfBirth)),
            contactNumber: String(payload.contactNumber),
            promoCode: payload.promoCode ? String(payload.promoCode) : undefined,
            status: plan_sale_schema_1.PlanSaleStatus.PENDING_PAYMENT,
            paymentId: pay._id,
        });
    }
    async initiateAffiliateCheckout(sellerId, dto) {
        const plan = await this.planModel.findById(dto.planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        let sellerOid = new mongoose_2.Types.ObjectId(sellerId);
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
    async initiateGuestCheckout(dto) {
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
    async finalizeGuestCheckout(paymentId) {
        const pay = await this.paymentModel.findById(paymentId).lean();
        const kind = pay?.providerPayload?.checkoutKind;
        if (!pay || kind !== 'guest') {
            throw new common_1.BadRequestException('Invalid guest checkout session');
        }
        return this.completeSaleByPaymentId(paymentId);
    }
    async initiateSelfCheckout(buyerUserId, dto) {
        const plan = await this.plansService.resolvePlanOrThrow(dto.planTierId);
        const buyer = await this.usersService.findById(buyerUserId);
        if (!buyer)
            throw new common_1.NotFoundException('User not found');
        const planOid = plan._id;
        const buyerOid = new mongoose_2.Types.ObjectId(buyerUserId);
        let sellerOid = buyer.referredBy
            ? buyer.referredBy
            : new mongoose_2.Types.ObjectId(this.config.get('platform.userId') || '000000000000000000000000');
        let promo = dto.promoCode?.trim()?.toUpperCase();
        const ownCode = buyer.referralCode?.trim()?.toUpperCase();
        const isOwnPromo = Boolean(promo && ownCode && promo === ownCode);
        if (promo && !isOwnPromo) {
            const validated = await this.usersService.validateReferralCodeForCheckout(promo, buyerUserId);
            const owner = await this.usersService.findByReferralCode(validated.code);
            sellerOid = owner._id;
        }
        else if (!isOwnPromo && buyer.referredBy) {
            const uplineUser = await this.usersService.findById(buyer.referredBy.toString());
            if (uplineUser && uplineUser.referralCode) {
                promo = uplineUser.referralCode;
            }
        }
        const existingPaid = await this.saleModel
            .findOne({ buyerUserId: buyerOid, planId: planOid, status: plan_sale_schema_1.PlanSaleStatus.PAID })
            .lean();
        if (existingPaid) {
            throw new common_1.ConflictException('You already have this plan active.');
        }
        const pricing = await this.resolveCheckoutPricing(plan, promo, buyerUserId);
        if (pricing.samePlan) {
            throw new common_1.ConflictException('You already have this plan active.');
        }
        if (pricing.isDowngrade) {
            throw new common_1.BadRequestException('Downgrades are not supported. Choose a higher plan from Upgrade Plan.');
        }
        const fullName = dto.fullName.trim();
        const email = buyer.email;
        const age = buyer.age ?? 0;
        const dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : (buyer.dateOfBirth ?? new Date());
        const contactNumber = (dto.contactNumber || buyer.phone || '').trim();
        let sale = await this.saleModel
            .findOne({ buyerUserId: buyerOid, planId: planOid, status: plan_sale_schema_1.PlanSaleStatus.PENDING_PAYMENT })
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
                status: plan_sale_schema_1.PlanSaleStatus.PENDING_PAYMENT,
                isUpgrade: pricing.isUpgrade,
                upgradedFromPlanId: pricing.isUpgrade ? buyer.planId : null,
            });
        }
        else {
            sale.fullName = fullName;
            sale.age = age;
            sale.dateOfBirth = dateOfBirth;
            sale.contactNumber = contactNumber;
            sale.promoCode = promo;
            sale.sellerId = sellerOid;
            sale.isUpgrade = pricing.isUpgrade;
            sale.upgradedFromPlanId = pricing.isUpgrade ? buyer.planId : null;
            await sale.save();
        }
        const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(buyerUserId, pricing.finalSubtotal, { planId: planOid.toString(), couponCode: promo });
        sale.paymentId = paymentOrder.payment._id;
        await sale.save();
        if (promo) {
            await this.usersService.setLockedAffiliateCouponIfUnset(buyerUserId, promo);
        }
        return this.checkoutResponse(sale, plan, paymentOrder, email, pricing);
    }
    async finalizeCheckout(actorUserId, paymentId, saleId) {
        if (saleId) {
            const sale = await this.saleModel
                .findById(saleId)
                .select('+buyerTempPassword')
                .populate('planId', 'name price')
                .exec();
            if (!sale)
                throw new common_1.NotFoundException('Sale not found');
            const isBuyer = sale.buyerUserId?.toString() === actorUserId;
            const isSeller = sale.sellerId.toString() === actorUserId;
            if (!isBuyer && !isSeller) {
                throw new common_1.BadRequestException('Not allowed to finalize this sale');
            }
            if (sale.paymentId?.toString() !== paymentId) {
                throw new common_1.BadRequestException('Payment does not match this sale');
            }
        }
        else {
            const selfSale = await this.saleModel
                .findOne({
                paymentId: new mongoose_2.Types.ObjectId(paymentId),
                buyerUserId: new mongoose_2.Types.ObjectId(actorUserId),
            })
                .exec();
            if (selfSale) {
                return this.completeSaleByPaymentId(paymentId);
            }
            const pay = await this.paymentModel.findById(paymentId).lean();
            const payload = pay?.providerPayload;
            if (!payload || payload.checkoutKind !== 'affiliate') {
                throw new common_1.BadRequestException('Checkout session not found');
            }
            const affiliateSellerId = String(payload.affiliateSellerId ?? '');
            const sellerId = String(payload.sellerId ?? '');
            if (affiliateSellerId !== actorUserId && sellerId !== actorUserId) {
                throw new common_1.BadRequestException('Not allowed to finalize this checkout');
            }
        }
        return this.completeSaleByPaymentId(paymentId);
    }
    async completeSaleByPaymentId(paymentId) {
        const pay = await this.paymentModel.findById(paymentId).exec();
        if (!pay)
            throw new common_1.BadRequestException('Payment not found');
        const key = this.config.get('razorpay.keyId');
        const paymentMock = this.config.get('razorpay.paymentMock') === true;
        if (key && pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Payment not completed yet');
        }
        if (!key && paymentMock && pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            await this.paymentModel.findByIdAndUpdate(paymentId, { status: app_constants_1.PaymentStatus.COMPLETED }).exec();
            pay.status = app_constants_1.PaymentStatus.COMPLETED;
        }
        if (!key && !paymentMock && pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env.');
        }
        let sale = await this.saleModel
            .findOne({ paymentId: new mongoose_2.Types.ObjectId(paymentId) })
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
        if (!sale)
            throw new common_1.NotFoundException('Plan sale not found for this payment');
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PAID) {
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
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL) {
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
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.REJECTED) {
            throw new common_1.BadRequestException('This plan sale was rejected by admin.');
        }
        const plan = sale.planId;
        const planOid = plan?._id ?? sale.planId;
        let loginPassword = '';
        let buyerId;
        if (!sale.buyerUserId) {
            const existing = await this.usersService.findByEmail(sale.email);
            if (existing?.accountActive && existing.planId) {
                throw new common_1.ConflictException('Email already registered with an active plan');
            }
            if (existing?.accountActive && !existing.planId) {
                buyerId = existing._id.toString();
                loginPassword = sale.buyerTempPassword || (0, uuid_1.v4)().slice(0, 12);
                await this.usersService.activateAccount(buyerId, loginPassword);
                sale.buyerUserId = existing._id;
                sale.buyerTempPassword = loginPassword;
            }
            else {
                await this.usersService.deleteInactiveUserByEmail(sale.email);
                loginPassword = sale.buyerTempPassword || (0, uuid_1.v4)().slice(0, 12);
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
                });
                sale.buyerUserId = buyer._id;
                sale.buyerTempPassword = loginPassword;
                buyerId = buyer._id.toString();
            }
        }
        else {
            buyerId = sale.buyerUserId.toString();
            const buyer = await this.usersService.findById(buyerId);
            if (!buyer?.accountActive) {
                loginPassword = sale.buyerTempPassword || (0, uuid_1.v4)().slice(0, 12);
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
        sale.status = plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL;
        await sale.save();
        void this.mail
            .planSaleAwaitingAdminApproval(sale.email, sale.fullName, plan?.name || 'Plan', loginPassword || undefined)
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
                    loginUrl: this.config.get('frontendUrl') || 'http://localhost:5173',
                }
                : undefined,
        };
    }
    async adminDecidePlanSale(id, approve, adminNote) {
        const sale = await this.saleModel
            .findById(id)
            .select('+buyerTempPassword')
            .populate('planId', 'name price promoPrice tierId')
            .exec();
        if (!sale)
            throw new common_1.NotFoundException('Plan sale not found');
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PENDING_PAYMENT) {
            throw new common_1.BadRequestException('Payment not confirmed yet. Confirm payment first.');
        }
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PAID) {
            throw new common_1.BadRequestException('Plan is already active');
        }
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.REJECTED) {
            throw new common_1.BadRequestException('Plan sale already rejected');
        }
        if (sale.status !== plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Invalid plan sale status');
        }
        sale.adminNote = adminNote?.trim() || sale.adminNote;
        if (!approve) {
            sale.status = plan_sale_schema_1.PlanSaleStatus.REJECTED;
            await sale.save();
            const plan = sale.planId;
            void this.mail
                .planSaleRejected(sale.email, sale.fullName, plan?.name || 'Plan', adminNote)
                .catch(() => undefined);
            return { rejected: true, sale, message: 'Plan sale rejected.' };
        }
        return this.activateApprovedPlanSale(sale);
    }
    countPendingApprovals() {
        return this.saleModel.countDocuments({ status: plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL }).exec();
    }
    findPendingApprovalForBuyer(userId) {
        return this.saleModel
            .findOne({
            buyerUserId: new mongoose_2.Types.ObjectId(userId),
            status: plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL,
        })
            .populate('planId', 'name')
            .lean()
            .exec();
    }
    async activateApprovedPlanSale(sale) {
        const pay = await this.paymentModel.findById(sale.paymentId).exec();
        if (!pay)
            throw new common_1.BadRequestException('Payment not found for this sale');
        if (pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Payment must be completed before plan activation');
        }
        const plan = sale.planId;
        const planOid = plan?._id ?? sale.planId;
        if (!sale.buyerUserId) {
            throw new common_1.BadRequestException('Buyer account missing for this sale');
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
        sale.status = plan_sale_schema_1.PlanSaleStatus.PAID;
        await sale.save();
        if (sale.promoCode) {
            const planPrice = plan?.price ?? pay.amount;
            const coupon = await this.promoCoupons.computeDiscount(sale.promoCode, planPrice);
            if (coupon)
                await this.promoCoupons.incrementUsage(sale.promoCode);
        }
        const yourPromoCode = await this.usersService.ensureReferralCode(buyerId);
        const seller = await this.usersService.findById(sale.sellerId.toString());
        if (seller && !sale.commissionsDistributed) {
            try {
                const soldPlan = plan;
                const commissionBase = await this.resolvePlanSaleCommissionBase(seller, soldPlan);
                await this.revenueDistribution.distributePlanSale(sale, pay.amount, seller, commissionBase);
            }
            catch (err) {
                this.logger.warn(`Plan sale ${sale._id} activated but commission split failed: ${err.message}`);
            }
        }
        void this.mail
            .planSaleActivated(sale.email, sale.fullName, plan?.name || 'Plan', loginPassword, yourPromoCode)
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
    async create(sellerId, dto) {
        return this.initiateAffiliateCheckout(sellerId, dto);
    }
    async purchaseSelf(buyerUserId, dto) {
        if (!dto.paymentId) {
            return this.initiateSelfCheckout(buyerUserId, dto);
        }
        const sale = await this.saleModel
            .findOne({
            paymentId: new mongoose_2.Types.ObjectId(dto.paymentId),
            buyerUserId: new mongoose_2.Types.ObjectId(buyerUserId),
        })
            .exec();
        if (!sale)
            throw new common_1.BadRequestException('Sale not found for this payment');
        return this.finalizeCheckout(buyerUserId, dto.paymentId, sale._id.toString());
    }
    checkoutResponse(sale, plan, paymentOrder, email, pricing) {
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
                    targetPrice: pricing.targetPrice,
                    upgradeCredit: pricing.upgradeCredit ?? 0,
                    isUpgrade: pricing.isUpgrade ?? false,
                    currentPlan: pricing.currentPlan ?? null,
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
            message: 'Proceed to Razorpay payment. Your details are saved only after successful payment.',
        };
    }
    sellerSaleFilter(sellerId, referralCode) {
        const or = [{ sellerId: new mongoose_2.Types.ObjectId(sellerId) }];
        const code = referralCode?.trim()?.toUpperCase();
        if (code)
            or.push({ promoCode: code });
        return { $or: or };
    }
    dedupeSalesByBuyer(items) {
        const seen = new Set();
        const out = [];
        for (const s of items) {
            const buyerId = s.buyerUserId && typeof s.buyerUserId === 'object' && '_id' in s.buyerUserId
                ? String(s.buyerUserId._id)
                : s.buyerUserId
                    ? String(s.buyerUserId)
                    : null;
            const key = buyerId ?? s.email?.trim().toLowerCase();
            if (!key || seen.has(key))
                continue;
            seen.add(key);
            out.push(s);
        }
        return out;
    }
    async listMine(sellerId) {
        const seller = await this.usersService.findById(sellerId);
        const items = await this.saleModel
            .find(this.sellerSaleFilter(sellerId, seller?.referralCode))
            .sort({ createdAt: -1 })
            .select('+buyerTempPassword')
            .populate('planId', 'name price')
            .populate('buyerUserId', 'name email accountActive phone')
            .lean();
        const uniqueItems = this.dedupeSalesByBuyer(items);
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
            password: s.status === plan_sale_schema_1.PlanSaleStatus.PAID || s.status === plan_sale_schema_1.PlanSaleStatus.PAID_PENDING_APPROVAL
                ? s.buyerTempPassword || null
                : null,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            source: s.sellerId?.toString() === sellerId ? 'direct_sale' : 'promo_code',
        }));
    }
    listAll(filter) {
        const page = filter.page || 1;
        const limit = filter.limit || 20;
        const q = {};
        if (filter.status)
            q.status = filter.status;
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
    async markPaid(id, adminNote) {
        const sale = await this.saleModel.findById(id).select('+buyerTempPassword').populate('planId', 'name').exec();
        if (!sale)
            throw new common_1.NotFoundException();
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PAID)
            throw new common_1.BadRequestException('Already paid');
        if (!sale.buyerTempPassword) {
            sale.buyerTempPassword = (0, uuid_1.v4)().slice(0, 12);
        }
        sale.adminNote = adminNote;
        await sale.save();
        if (sale.paymentId) {
            await this.paymentModel.findByIdAndUpdate(sale.paymentId, { status: app_constants_1.PaymentStatus.COMPLETED }).exec();
            return this.completeSaleByPaymentId(sale.paymentId.toString());
        }
        const plan = sale.planId;
        const payerUserId = sale.buyerUserId ?? sale.sellerId;
        const pay = await this.paymentModel.create({
            payerUserId,
            planId: sale.planId,
            amount: plan?.price ?? 0,
            currency: 'INR',
            provider: 'manual',
            status: app_constants_1.PaymentStatus.COMPLETED,
            externalId: `manual_${Date.now()}`,
        });
        sale.paymentId = pay._id;
        await sale.save();
        return this.completeSaleByPaymentId(pay._id.toString());
    }
};
exports.PlanSalesService = PlanSalesService;
exports.PlanSalesService = PlanSalesService = PlanSalesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(plan_sale_schema_1.PlanSale.name)),
    __param(1, (0, mongoose_1.InjectModel)(plan_schema_1.Plan.name)),
    __param(2, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => payment_gateway_service_1.PaymentGatewayService))),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => revenue_distribution_service_1.RevenueDistributionService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService,
        plans_service_1.PlansService,
        mail_service_1.MailService,
        config_1.ConfigService,
        payment_gateway_service_1.PaymentGatewayService,
        revenue_distribution_service_1.RevenueDistributionService,
        promo_coupons_service_1.PromoCouponsService,
        settings_service_1.SettingsService])
], PlanSalesService);
function round2(n) {
    return Math.round(n * 100) / 100;
}
//# sourceMappingURL=plan-sales.service.js.map