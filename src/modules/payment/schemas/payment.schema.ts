import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../common/constants/app.constants';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  payerUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', default: null })
  courseId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Plan', default: null })
  planId: Types.ObjectId | null;

  @Prop()
  couponCode: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ enum: ['stripe', 'razorpay', 'manual'], required: true })
  provider: 'stripe' | 'razorpay' | 'manual';

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  externalId: string;

  @Prop({ type: Object })
  providerPayload: Record<string, unknown>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ externalId: 1, provider: 1 });
