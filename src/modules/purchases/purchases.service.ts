import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './purchase.schema';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { RevenueDistributionService } from '../commission/revenue-distribution.service';
import { SettingsService } from '../settings/settings.service';
import { PlansService } from '../plans/plans.service';
import { PaymentStatus } from '../../common/constants/app.constants';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private usersService: UsersService,
    private coursesService: CoursesService,
    private revenueDistributionService: RevenueDistributionService,
    private settingsService: SettingsService,
    private plansService: PlansService,
  ) {}

  /** Purchase completed OR active plan includes this course. */
  async hasCourseAccess(userId: string, courseOid: Types.ObjectId): Promise<boolean> {
    if (await this.hasCompletedCourseAccess(userId, courseOid)) return true;
    const buyer = await this.usersService.findById(userId);
    if (!buyer?.accountActive || !buyer.planId) return false;
    return this.plansService.planIncludesCourse(buyer.planId as Types.ObjectId, courseOid);
  }

  effectiveCoursePrice(course: any): number {
    const d = course.discountPrice;
    if (d != null && d > 0) return d;
    return course.price ?? 0;
  }

  async create(purchase: Partial<Purchase> & { buyerId: string }): Promise<Purchase> {
    const course = await this.coursesService.findById(purchase.courseId as any);
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isPublished) throw new BadRequestException('Course is not available');

    const expected = this.effectiveCoursePrice(course);
    const paid = purchase.amount ?? expected;
    if (Math.abs(paid - expected) > 0.02) {
      throw new BadRequestException(`Amount must match course price (${expected})`);
    }

    const buyerOid = new Types.ObjectId(purchase.buyerId);
    const buyerIdStr = purchase.buyerId;
    const buyer = await this.usersService.findById(buyerIdStr);
    const locked = buyer?.lockedAffiliateCoupon?.trim?.()?.toUpperCase?.() || null;
    const requested = purchase.couponUsed?.trim?.()?.toUpperCase?.() || undefined;

    let effectiveCoupon: string | undefined;
    if (locked) {
      if (requested && requested !== locked) {
        throw new BadRequestException(
          `Affiliate attribution is locked to referral code ${locked} from your first signup or purchase. You cannot use a different code.`,
        );
      }
      effectiveCoupon = locked;
    } else {
      effectiveCoupon = requested;
    }

    const courseOid = new Types.ObjectId(purchase.courseId as any);

    const dup = await this.purchaseModel
      .findOne({
        buyerId: buyerOid,
        courseId: courseOid,
        paymentStatus: PaymentStatus.COMPLETED,
      })
      .exec();
    if (dup) throw new ConflictException('Course already purchased');

    const settings = await this.settingsService.getGlobal();
    let couponOwner = null as any;
    if (effectiveCoupon) {
      couponOwner = await this.usersService.findByReferralCode(effectiveCoupon);
      if (!couponOwner) throw new BadRequestException('Invalid coupon code');
      const isLockedAttribution = Boolean(locked && effectiveCoupon === locked);
      if (!isLockedAttribution && !course.couponApplicable) {
        throw new BadRequestException('Coupons not allowed for this course');
      }
      if (settings.fraudBlockCouponOwnerPurchase && couponOwner._id.equals(buyerOid)) {
        throw new BadRequestException('Cannot purchase using your own coupon');
      }
    }

    let paymentStatus = PaymentStatus.PENDING;
    if (purchase.paymentId) {
      const pay = await this.paymentModel.findById(purchase.paymentId).lean();
      if (pay?.status === PaymentStatus.COMPLETED) paymentStatus = PaymentStatus.COMPLETED;
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
        thumbnailUrl: (course as any).thumbnailUrl,
      },
    });
    const saved = await doc.save();

    if (couponOwner) {
      await this.revenueDistributionService.distributePurchase(saved, course as any, couponOwner);
      await this.coursesService.incrementSales((course as any)._id.toString());
      if (effectiveCoupon) {
        await this.usersService.setLockedAffiliateCouponIfUnset(buyerIdStr, effectiveCoupon);
      }
    } else {
      await this.revenueDistributionService.distributePlatformOnly(saved);
      await this.coursesService.incrementSales((course as any)._id.toString());
    }

    return this.purchaseModel.findById(saved._id).exec();
  }

  async findByUser(userId: string): Promise<Purchase[]> {
    return this.purchaseModel
      .find({ buyerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any;
  }

  /** Learner can stream all lesson videos (not only free previews). */
  async hasCompletedCourseAccess(userId: string, courseObjectId: Types.ObjectId): Promise<boolean> {
    const p = await this.purchaseModel
      .findOne({
        buyerId: new Types.ObjectId(userId),
        courseId: courseObjectId,
        paymentStatus: PaymentStatus.COMPLETED,
      })
      .select({ _id: 1 })
      .lean()
      .exec();
    return Boolean(p);
  }

  async findByCoupon(coupon: string): Promise<Purchase[]> {
    return this.purchaseModel
      .find({ couponUsed: coupon?.toUpperCase() })
      .sort({ createdAt: -1 })
      .exec();
  }

  async listAffiliateSales(
    couponCode: string,
    opts: { from?: Date; to?: Date; page?: number; limit?: number },
  ) {
    const filter: any = { couponUsed: couponCode?.toUpperCase(), paymentStatus: PaymentStatus.COMPLETED };
    if (opts.from || opts.to) {
      filter.createdAt = {};
      if (opts.from) filter.createdAt.$gte = opts.from;
      if (opts.to) filter.createdAt.$lte = opts.to;
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
}
