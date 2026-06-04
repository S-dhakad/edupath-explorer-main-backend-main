import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionDocument = Commission & Document;

@Schema({ timestamps: true, collection: 'commissions' })
export class Commission {
  @Prop({ type: Types.ObjectId, ref: 'Purchase', default: null })
  purchaseId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'PlanSale', default: null })
  planSaleId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  beneficiaryUserId: Types.ObjectId | null;

  @Prop({ required: true })
  beneficiaryRole: 'coupon_owner' | 'direct_parent' | 'platform';

  @Prop({ required: true, enum: ['active', 'passive', 'platform'] })
  incomeCategory: 'active' | 'passive' | 'platform';

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: 0 })
  percentApplied: number;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
CommissionSchema.index({ beneficiaryUserId: 1, createdAt: -1 });
CommissionSchema.index({ purchaseId: 1 });
