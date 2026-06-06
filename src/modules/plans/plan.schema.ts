import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema()
export class Plan {
  @Prop({ required: true })
  name: string;

  /** MRP / original price shown with strikethrough (e.g. ₹1500). */
  @Prop({ required: true })
  price: number;

  /** Fixed selling price when a member referral promo code is applied (e.g. ₹999). */
  @Prop()
  promoPrice?: number;

  @Prop([String])
  features: string[];

  /** Links to admin landing pricing tier id (e.g. `basic`, `smart`). */
  @Prop({ unique: true, sparse: true })
  tierId?: string;

  @Prop()
  period?: string;

  @Prop({ default: true })
  active: boolean;

  /** Courses included with this membership (full playlist access when plan is active). */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courseIds: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);