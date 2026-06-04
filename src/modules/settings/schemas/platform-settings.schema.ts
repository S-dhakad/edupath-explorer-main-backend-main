import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  DEFAULT_COUPON_OWNER_PCT,
  DEFAULT_DIRECT_PARENT_PCT,
  DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT,
  DEFAULT_PLATFORM_PCT,
} from '../../../common/constants/app.constants';

export type PlatformSettingsDocument = PlatformSettings & Document;

@Schema({ timestamps: true, collection: 'settings' })
export class PlatformSettings {
  @Prop({ unique: true, default: 'global' })
  key: string;

  @Prop({ default: DEFAULT_COUPON_OWNER_PCT })
  couponOwnerPercent: number;

  @Prop({ default: DEFAULT_PLATFORM_PCT })
  platformPercent: number;

  @Prop({ default: DEFAULT_DIRECT_PARENT_PCT })
  directParentPercent: number;

  /** % off plan list price when buyer uses a member promo code (e.g. 40 → ₹2000 becomes ₹1200). */
  @Prop({ default: DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT })
  memberPromoBuyerDiscountPercent: number;

  @Prop({ default: true })
  fraudBlockSelfReferral: boolean;

  @Prop({ default: true })
  fraudBlockCouponOwnerPurchase: boolean;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
