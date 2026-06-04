import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromoCouponDocument = HydratedDocument<PromoCoupon>;

@Schema({ timestamps: true })
export class PromoCoupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'], default: 'percentage' })
  discountType: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0 })
  minPurchase: number;

  @Prop({ default: 0 })
  maxUsage: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: true })
  active: boolean;
}

export const PromoCouponSchema = SchemaFactory.createForClass(PromoCoupon);
