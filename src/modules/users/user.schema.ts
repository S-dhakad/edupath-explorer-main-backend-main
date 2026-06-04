import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, AffiliateRank } from '../../common/constants/app.constants';

export type UserDocument = User & Document;

@Schema({ _id: true, timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  /** Unique affiliate / referral coupon code */
  @Prop({ unique: true, sparse: true })
  referralCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  referredBy: Types.ObjectId | null;

  /**
   * First valid referral / coupon code applied (signup or first purchase).
   * All later purchases use this for commission; buyer cannot switch to another code.
   */
  @Prop({ default: null })
  lockedAffiliateCoupon: string | null;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ select: false })
  emailVerificationToken: string;

  @Prop({ select: false })
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;

  @Prop({ select: false })
  refreshTokenHash: string;

  @Prop({ default: true })
  accountActive: boolean;

  @Prop()
  age: number;

  @Prop()
  dateOfBirth: Date;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: false })
  isVerifiedSeller: boolean;

  @Prop({ enum: AffiliateRank, default: AffiliateRank.BRONZE })
  rank: AffiliateRank;

  @Prop({ type: Types.ObjectId, ref: 'Plan', default: null })
  planId: Types.ObjectId | null;

  @Prop({ default: 0 })
  activeIncome: number;

  @Prop({ default: 0 })
  passiveIncome: number;

  @Prop({ default: 0 })
  totalReferralsCount: number;

  @Prop({ default: 0 })
  directReferralsCount: number;

  /** Google / Facebook ids optional */
  @Prop()
  googleId: string;

  @Prop()
  facebookId: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ referredBy: 1 });
