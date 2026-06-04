import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KycDocument = Kyc & Document;

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Kyc {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  aadharNumber: string;

  @Prop({ required: true })
  panNumber: string;

  @Prop()
  aadharImage: string;

  @Prop()
  panImage: string;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  ifscCode: string;

  @Prop({ required: true })
  accountHolderName: string;

  @Prop({
    type: String,
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  status: KycStatus;

  @Prop()
  adminNote: string;

  @Prop()
  razorpayContactId?: string;

  @Prop()
  razorpayFundAccountId?: string;
}

export const KycSchema = SchemaFactory.createForClass(Kyc);
