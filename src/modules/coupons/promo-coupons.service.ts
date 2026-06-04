import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCoupon, PromoCouponDocument } from './promo-coupon.schema';

@Injectable()
export class PromoCouponsService {
  constructor(@InjectModel(PromoCoupon.name) private model: Model<PromoCouponDocument>) {}

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async create(dto: Partial<PromoCoupon>) {
    const code = dto.code?.trim()?.toUpperCase();
    if (!code) throw new BadRequestException('Coupon code is required');
    const exists = await this.model.findOne({ code }).lean();
    if (exists) throw new BadRequestException('Coupon code already exists');
    const doc = await this.model.create({
      code,
      discountType: dto.discountType || 'percentage',
      discountValue: dto.discountValue ?? 0,
      minPurchase: dto.minPurchase ?? 0,
      maxUsage: dto.maxUsage ?? 0,
      usedCount: 0,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      active: dto.active !== false,
    });
    return doc.toObject();
  }

  async update(id: string, dto: Partial<PromoCoupon>) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Coupon not found');
    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const dup = await this.model.findOne({ code, _id: { $ne: id } }).lean();
      if (dup) throw new BadRequestException('Coupon code already exists');
      doc.code = code;
    }
    if (dto.discountType) doc.discountType = dto.discountType;
    if (dto.discountValue != null) doc.discountValue = dto.discountValue;
    if (dto.minPurchase != null) doc.minPurchase = dto.minPurchase;
    if (dto.maxUsage != null) doc.maxUsage = dto.maxUsage;
    if (dto.expiresAt !== undefined) doc.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    if (dto.active != null) doc.active = dto.active;
    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Coupon not found');
    return { deleted: true };
  }

  /**
   * Returns discount for an admin promo coupon code, or null if code is not a coupon.
   */
  async computeDiscount(
    code: string,
    subtotal: number,
  ): Promise<{
    kind: 'admin_coupon';
    code: string;
    discountAmount: number;
    finalSubtotal: number;
    label: string;
  } | null> {
    const upper = code?.trim()?.toUpperCase();
    if (!upper) return null;

    const coupon = await this.model.findOne({ code: upper, active: true }).lean();
    if (!coupon) return null;

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('This promo coupon has expired');
    }
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
      throw new BadRequestException('This promo coupon has reached its usage limit');
    }
    if (subtotal < (coupon.minPurchase ?? 0)) {
      throw new BadRequestException(
        `Minimum purchase ₹${coupon.minPurchase} required for this coupon`,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(subtotal, Math.round(coupon.discountValue));
    }
    discountAmount = Math.max(0, Math.min(subtotal, discountAmount));
    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const label =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% off`
        : `₹${coupon.discountValue} off`;

    return {
      kind: 'admin_coupon',
      code: upper,
      discountAmount,
      finalSubtotal,
      label,
    };
  }

  async incrementUsage(code: string) {
    const upper = code?.trim()?.toUpperCase();
    if (!upper) return;
    await this.model.updateOne({ code: upper }, { $inc: { usedCount: 1 } }).exec();
  }
}
