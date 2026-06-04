import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlanSaleDocument = PlanSale & Document;

export enum PlanSaleStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
}

@Schema({ timestamps: true, collection: 'plan_sales' })
export class PlanSale {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  contactNumber: string;

  @Prop()
  promoCode: string;

  @Prop({ enum: PlanSaleStatus, default: PlanSaleStatus.PENDING_PAYMENT })
  status: PlanSaleStatus;

  @Prop()
  adminNote: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  paymentId: Types.ObjectId | null;

  @Prop({ default: false })
  commissionsDistributed: boolean;

  /** Plain temporary password for seller handoff (not the hashed user password). */
  @Prop({ select: false })
  buyerTempPassword: string;
}

export const PlanSaleSchema = SchemaFactory.createForClass(PlanSale);
PlanSaleSchema.index({ sellerId: 1, createdAt: -1 });
PlanSaleSchema.index({ status: 1, createdAt: -1 });
PlanSaleSchema.index({ paymentId: 1 });
