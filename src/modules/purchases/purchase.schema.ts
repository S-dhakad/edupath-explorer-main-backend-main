import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../common/constants/app.constants';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true, collection: 'purchases' })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId;

  @Prop()
  couponUsed: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  paymentId: Types.ObjectId | null;

  @Prop({ default: false })
  commissionsDistributed: boolean;

  @Prop({ type: Object })
  courseSnapshot: Record<string, unknown>;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
PurchaseSchema.index({ buyerId: 1, courseId: 1 });
PurchaseSchema.index({ couponUsed: 1, createdAt: -1 });
PurchaseSchema.index({ createdAt: -1 });
