import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WalletTransactionType } from '../../../common/constants/app.constants';

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true, collection: 'walletTransactions' })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Purchase', default: null })
  purchaseId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Withdrawal', default: null })
  withdrawalId: Types.ObjectId | null;

  @Prop({ enum: WalletTransactionType, required: true })
  type: WalletTransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: 0 })
  balanceAfter: number;

  @Prop({ type: Object })
  meta: Record<string, unknown>;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
