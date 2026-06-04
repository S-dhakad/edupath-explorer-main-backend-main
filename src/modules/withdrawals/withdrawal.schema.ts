import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WithdrawalStatus } from '../../common/constants/app.constants';

export type WithdrawalDocument = Withdrawal & Document;

@Schema({ timestamps: true, collection: 'withdrawals' })
export class Withdrawal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Prop({ enum: ['upi', 'bank', 'paypal'], required: true })
  method: 'upi' | 'bank' | 'paypal';

  @Prop()
  accountHolderName: string;

  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  ifscCode: string;

  @Prop()
  upiId: string;

  @Prop()
  paypalEmail: string;

  @Prop()
  adminNote: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  processedBy?: Types.ObjectId;

  @Prop({ default: 'razorpayx' })
  payoutProvider?: string;

  @Prop()
  razorpayContactId?: string;

  @Prop()
  razorpayFundAccountId?: string;

  @Prop()
  razorpayPayoutId?: string;

  @Prop()
  payoutProviderStatus?: string;

  @Prop()
  payoutError?: string;

  @Prop()
  payoutInitiatedAt?: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
