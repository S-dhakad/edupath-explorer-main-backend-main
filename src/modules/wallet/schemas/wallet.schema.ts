import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  /** Immediately withdrawable */
  @Prop({ default: 0 })
  availableBalance: number;

  /** Locked for pending withdrawal requests */
  @Prop({ default: 0 })
  pendingBalance: number;

  @Prop({ default: 'INR' })
  currency: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
