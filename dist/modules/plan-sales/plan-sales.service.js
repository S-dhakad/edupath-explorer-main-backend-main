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
    async quoteCheckout(planId, promoCode) {
        const plan = await this.planModel.findById(planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const pricing = await this.resolvePlanPricing(plan.price, promoCode);
        const tax = Math.round(pricing.finalSubtotal * 0.18);
        const settings = await this.settingsService.getGlobal();
        const commissionPreview = this.buildCommissionPreview(pricing.finalSubtotal, pricing.promoOwner, settings.couponOwnerPercent, settings.directParentPercent, settings.platformPercent);
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
    assertMemberPromoOwnerActive(owner) {
        if (!owner.accountActive) {
            throw new common_1.BadRequestException('This member promo code is not active yet.');
        }
        if (!owner.planId) {
            throw new common_1.BadRequestException('This member must have an active plan before their promo code can be used.');
        }
    }
    buildCommissionPreview(paidAmount, promoOwner, ownerPct, parentPct, platPct) {
        const base = paidAmount;
        const sellerShare = round2((base * ownerPct) / 100);
        let platformShare = round2((base * platPct) / 100);
        let parentShare = round2((base * parentPct) / 100);
        const parentId = promoOwner?.referredBy ? promoOwner.referredBy.toString() : null;
        if (!parentId) {
            platformShare = round2(platformShare + parentShare);
            parentShare = 0;
        }
        return {
            paidAmount: base,
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
    async resolvePlanPricing(planPrice, promoCode) {
        const subtotal = planPrice;
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
        const owner = await this.usersService.findByReferralCode(trimmed);
        if (!owner)
            throw new common_1.BadRequestException('Invalid promo / referral code');
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
            kind: 'member_referral',
            referrerName: owner.name,
            promoOwner: owner,
            discountLabel: `${pct}% member promo`,
            attributionOnly: false,
        };
    }
    async initiateAffiliateCheckout(sellerId, dto) {
        const email = dto.email.trim().toLowerCase();
        const existing = await this.usersService.findByEmail(email);
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const plan = await this.planModel.findById(dto.planId).lean();
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        let sellerOid = new mongoose_2.Types.ObjectId(sellerId);
        const promo = dto.promoCode?.trim()?.toUpperCase();
        if (promo) {
            const owner = await this.usersService.findByReferralCode(promo);
            if (!owner)
                throw new common_1.BadRequestException('Invalid promo / referral code');
            this.assertMemberPromoOwnerActive(owner);
            sellerOid = owner._id;
        }
        const tempPassword = (0, uuid_1.v4)().slice(0, 12);
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
            planId: new mongoose_2.Types.ObjectId(dto.planId),
            fullName: dto.fullName.trim(),
            email,
            age: dto.age,
            dateOfBirth: new Date(dto.dateOfBirth),
            contactNumber: dto.contactNumber,
            promoCode: promo,
            status: plan_sale_schema_1.PlanSaleStatus.PENDING_PAYMENT,
            buyerTempPassword: tempPassword,
        });
        const pricing = await this.resolvePlanPricing(plan.price, promo);
        const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(buyer._id.toString(), pricing.finalSubtotal, { planId: dto.planId, couponCode: promo });
        sale.paymentId = paymentOrder.payment._id;
        await sale.save();
        return this.checkoutResponse(sale, plan, paymentOrder, email, pricing);
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
        const promo = dto.promoCode?.trim()?.toUpperCase();
        if (promo) {
            const validated = await this.usersService.validateReferralCodeForCheckout(promo, buyerUserId);
            const owner = await this.usersService.findByReferralCode(validated.code);
            sellerOid = owner._id;
        }
        const existingPaid = await this.saleModel
            .findOne({ buyerUserId: buyerOid, planId: planOid, status: plan_sale_schema_1.PlanSaleStatus.PAID })
            .lean();
        if (existingPaid) {
            throw new common_1.ConflictException('You already have this plan active.');
        }
        const fullName = dto.fullName.trim();
        const email = buyer.email;
        const age = dto.age;
        const dateOfBirth = new Date(dto.dateOfBirth);
        const contactNumber = dto.contactNumber.trim();
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
            });
        }
        else {
            sale.fullName = fullName;
            sale.age = age;
            sale.dateOfBirth = dateOfBirth;
            sale.contactNumber = contactNumber;
            sale.promoCode = promo;
            sale.sellerId = sellerOid;
            await sale.save();
        }
        const pricing = await this.resolvePlanPricing(plan.price, promo);
        const paymentOrder = await this.paymentGateway.createRazorpayLikeOrder(buyerUserId, pricing.finalSubtotal, { planId: planOid.toString(), couponCode: promo });
        sale.paymentId = paymentOrder.payment._id;
        await sale.save();
        if (promo) {
            await this.usersService.setLockedAffiliateCouponIfUnset(buyerUserId, promo);
        }
        return this.checkoutResponse(sale, plan, paymentOrder, email, pricing);
    }
    async finalizeCheckout(actorUserId, saleId, paymentId) {
        const sale = await this.saleModel.findById(saleId).select('+buyerTempPassword').populate('planId', 'name price').exec();
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        const isBuyer = sale.buyerUserId.toString() === actorUserId;
        const isSeller = sale.sellerId.toString() === actorUserId;
        if (!isBuyer && !isSeller) {
            throw new common_1.BadRequestException('Not allowed to finalize this sale');
        }
        if (sale.paymentId?.toString() !== paymentId) {
            throw new common_1.BadRequestException('Payment does not match this sale');
        }
        return this.completeSaleByPaymentId(paymentId);
    }
    async completeSaleByPaymentId(paymentId) {
        const pay = await this.paymentModel.findById(paymentId).exec();
        if (!pay)
            throw new common_1.BadRequestException('Payment not found');
        const key = this.config.get('razorpay.keyId');
        if (key && pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Payment not completed yet');
        }
        if (!key && pay.status !== app_constants_1.PaymentStatus.COMPLETED) {
            await this.paymentModel.findByIdAndUpdate(paymentId, { status: app_constants_1.PaymentStatus.COMPLETED }).exec();
            pay.status = app_constants_1.PaymentStatus.COMPLETED;
        }
        const sale = await this.saleModel
            .findOne({ paymentId: new mongoose_2.Types.ObjectId(paymentId) })
            .select('+buyerTempPassword')
            .populate('planId', 'name price')
            .exec();
        if (!sale)
            throw new common_1.NotFoundException('Plan sale not found for this payment');
        if (sale.status === plan_sale_schema_1.PlanSaleStatus.PAID) {
            const promo = await this.usersService.ensureReferralCode(sale.buyerUserId.toString());
            return {
                alreadyPaid: true,
                sale,
                yourPromoCode: promo,
                message: 'Plan already active.',
            };
        }
        const plan = sale.planId;
        const planOid = plan?._id ?? sale.planId;
        const buyerId = sale.buyerUserId.toString();
        let loginPassword = '';
        const buyer = await this.usersService.findById(buyerId);
        if (!buyer?.accountActive) {
            loginPassword = sale.buyerTempPassword || (0, uuid_1.v4)().slice(0, 12);
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
                await this.revenueDistribution.distributePlanSale(sale, pay.amount, seller);
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
            message: `Plan "${plan?.name || 'membership'}" is now active. Login details sent to ${sale.email}.`,
            accountActive: true,
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
        return this.finalizeCheckout(buyerUserId, sale._id.toString(), dto.paymentId);
    }
    checkoutResponse(sale, plan, paymentOrder, email, pricing) {
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
    sellerSaleFilter(sellerId, referralCode) {
        const or = [{ sellerId: new mongoose_2.Types.ObjectId(sellerId) }];
        const code = referralCode?.trim()?.toUpperCase();
        if (code)
            or.push({ promoCode: code });
        return { $or: or };
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
        return items.map((s) => ({
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
            password: s.status === plan_sale_schema_1.PlanSaleStatus.PAID ? null : s.buyerTempPassword || null,
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
        if (sale.paymentId) {
            await this.paymentModel.findByIdAndUpdate(sale.paymentId, { status: app_constants_1.PaymentStatus.COMPLETED }).exec();
            sale.adminNote = adminNote;
            await sale.save();
            return this.completeSaleByPaymentId(sale.paymentId.toString());
        }
        const tempPassword = sale.buyerTempPassword || (0, uuid_1.v4)().slice(0, 12);
        await this.usersService.activateAccount(sale.buyerUserId.toString(), tempPassword);
        sale.buyerTempPassword = tempPassword;
        sale.adminNote = adminNote;
        await sale.save();
        if (!sale.paymentId) {
            const plan = sale.planId;
            const pay = await this.paymentModel.create({
                payerUserId: sale.buyerUserId,
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
        return this.completeSaleByPaymentId(sale.paymentId.toString());
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