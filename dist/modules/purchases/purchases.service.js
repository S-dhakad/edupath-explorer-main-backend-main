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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const purchase_schema_1 = require("./purchase.schema");
const payment_schema_1 = require("../payment/schemas/payment.schema");
const users_service_1 = require("../users/users.service");
const courses_service_1 = require("../courses/courses.service");
const revenue_distribution_service_1 = require("../commission/revenue-distribution.service");
const settings_service_1 = require("../settings/settings.service");
const plans_service_1 = require("../plans/plans.service");
const app_constants_1 = require("../../common/constants/app.constants");
let PurchasesService = class PurchasesService {
    constructor(purchaseModel, paymentModel, usersService, coursesService, revenueDistributionService, settingsService, plansService) {
        this.purchaseModel = purchaseModel;
        this.paymentModel = paymentModel;
        this.usersService = usersService;
        this.coursesService = coursesService;
        this.revenueDistributionService = revenueDistributionService;
        this.settingsService = settingsService;
        this.plansService = plansService;
    }
    async hasCourseAccess(userId, courseOid) {
        if (await this.hasCompletedCourseAccess(userId, courseOid))
            return true;
        const buyer = await this.usersService.findById(userId);
        if (!buyer?.accountActive || !buyer.planId)
            return false;
        return this.plansService.planIncludesCourse(buyer.planId, courseOid);
    }
    effectiveCoursePrice(course) {
        const d = course.discountPrice;
        if (d != null && d > 0)
            return d;
        return course.price ?? 0;
    }
    async create(purchase) {
        const course = await this.coursesService.findById(purchase.courseId);
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (!course.isPublished)
            throw new common_1.BadRequestException('Course is not available');
        const expected = this.effectiveCoursePrice(course);
        const paid = purchase.amount ?? expected;
        if (Math.abs(paid - expected) > 0.02) {
            throw new common_1.BadRequestException(`Amount must match course price (${expected})`);
        }
        const buyerOid = new mongoose_2.Types.ObjectId(purchase.buyerId);
        const buyerIdStr = purchase.buyerId;
        const buyer = await this.usersService.findById(buyerIdStr);
        const locked = buyer?.lockedAffiliateCoupon?.trim?.()?.toUpperCase?.() || null;
        const requested = purchase.couponUsed?.trim?.()?.toUpperCase?.() || undefined;
        let effectiveCoupon;
        if (locked) {
            if (requested && requested !== locked) {
                throw new common_1.BadRequestException(`Affiliate attribution is locked to referral code ${locked} from your first signup or purchase. You cannot use a different code.`);
            }
            effectiveCoupon = locked;
        }
        else {
            effectiveCoupon = requested;
        }
        const courseOid = new mongoose_2.Types.ObjectId(purchase.courseId);
        const dup = await this.purchaseModel
            .findOne({
            buyerId: buyerOid,
            courseId: courseOid,
            paymentStatus: app_constants_1.PaymentStatus.COMPLETED,
        })
            .exec();
        if (dup)
            throw new common_1.ConflictException('Course already purchased');
        const settings = await this.settingsService.getGlobal();
        let couponOwner = null;
        if (effectiveCoupon) {
            couponOwner = await this.usersService.findByReferralCode(effectiveCoupon);
            if (!couponOwner)
                throw new common_1.BadRequestException('Invalid coupon code');
            const isLockedAttribution = Boolean(locked && effectiveCoupon === locked);
            if (!isLockedAttribution && !course.couponApplicable) {
                throw new common_1.BadRequestException('Coupons not allowed for this course');
            }
            if (settings.fraudBlockCouponOwnerPurchase && couponOwner._id.equals(buyerOid)) {
                throw new common_1.BadRequestException('Cannot purchase using your own coupon');
            }
        }
        let paymentStatus = app_constants_1.PaymentStatus.PENDING;
        if (purchase.paymentId) {
            const pay = await this.paymentModel.findById(purchase.paymentId).lean();
            if (pay?.status === app_constants_1.PaymentStatus.COMPLETED)
                paymentStatus = app_constants_1.PaymentStatus.COMPLETED;
        }
        const doc = new this.purchaseModel({
            courseId: courseOid,
            buyerId: buyerOid,
            couponUsed: effectiveCoupon,
            amount: paid,
            currency: purchase.currency || 'INR',
            paymentStatus,
            paymentId: purchase.paymentId || null,
            commissionsDistributed: false,
            courseSnapshot: {
                title: course.title,
                slug: course.slug,
                price: course.price,
                discountPrice: course.discountPrice,
                thumbnailUrl: course.thumbnailUrl,
            },
        });
        const saved = await doc.save();
        if (couponOwner) {
            await this.revenueDistributionService.distributePurchase(saved, course, couponOwner);
            await this.coursesService.incrementSales(course._id.toString());
            if (effectiveCoupon) {
                await this.usersService.setLockedAffiliateCouponIfUnset(buyerIdStr, effectiveCoupon);
            }
        }
        else {
            await this.revenueDistributionService.distributePlatformOnly(saved);
            await this.coursesService.incrementSales(course._id.toString());
        }
        return this.purchaseModel.findById(saved._id).exec();
    }
    async findByUser(userId) {
        return this.purchaseModel
            .find({ buyerId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async hasCompletedCourseAccess(userId, courseObjectId) {
        const p = await this.purchaseModel
            .findOne({
            buyerId: new mongoose_2.Types.ObjectId(userId),
            courseId: courseObjectId,
            paymentStatus: app_constants_1.PaymentStatus.COMPLETED,
        })
            .select({ _id: 1 })
            .lean()
            .exec();
        return Boolean(p);
    }
    async findByCoupon(coupon) {
        return this.purchaseModel
            .find({ couponUsed: coupon?.toUpperCase() })
            .sort({ createdAt: -1 })
            .exec();
    }
    async listAffiliateSales(couponCode, opts) {
        const filter = { couponUsed: couponCode?.toUpperCase(), paymentStatus: app_constants_1.PaymentStatus.COMPLETED };
        if (opts.from || opts.to) {
            filter.createdAt = {};
            if (opts.from)
                filter.createdAt.$gte = opts.from;
            if (opts.to)
                filter.createdAt.$lte = opts.to;
        }
        const page = opts.page || 1;
        const limit = opts.limit || 20;
        const [items, total] = await Promise.all([
            this.purchaseModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('buyerId', 'name email')
                .populate('courseId', 'title slug')
                .lean(),
            this.purchaseModel.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __param(1, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService,
        courses_service_1.CoursesService,
        revenue_distribution_service_1.RevenueDistributionService,
        settings_service_1.SettingsService,
        plans_service_1.PlansService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map