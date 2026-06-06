import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LandingPricingDocument = LandingPricing & Document;

const PricingTierSchema = {
  id: { type: String, required: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  /** MRP / original price (shown with strikethrough). */
  price: { type: Number, required: true },
  /** Fixed price charged when a member referral promo code is applied. */
  promoPrice: { type: Number },
  period: { type: String, required: true },
  features: { type: [String], default: [] },
  highlight: { type: Boolean, default: false },
  badge: { type: String },
  chip: { type: String, required: true },
  savings: { type: String, required: true },
  description: { type: String, required: true },
  /** Tailwind gradient classes for cover top wash, e.g. `from-primary/70 via-primary/40 to-transparent` */
  accent: { type: String, required: true },
  courseIds: { type: [String], default: [] },
  /** When true, tier appears on homepage / public pricing cards only (sell flow shows all active plans). */
  showOnLanding: { type: Boolean, default: false },
};

export type LandingPricingTier = {
  id: string;
  name: string;
  tagline: string;
  /** MRP / original price (shown with strikethrough). */
  price: number;
  /** Fixed price charged when a member referral promo code is applied. */
  promoPrice?: number;
  period: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  chip: string;
  savings: string;
  description: string;
  accent: string;
  /** MongoDB course ids attached to this plan tier */
  courseIds?: string[];
  /** Homepage marketing visibility (sell/checkout still lists all active plans). */
  showOnLanding?: boolean;
};

/** One row in the /plans compare table; `cells[i]` aligns with `tiers[i]`. */
export type LandingPricingCompareRow = {
  label: string;
  cells: string[];
};

const CompareRowSchema = {
  label: { type: String, required: true },
  cells: { type: [String], default: [] },
};

@Schema({ timestamps: true, collection: 'landingPricing' })
export class LandingPricing {
  @Prop({ unique: true, default: 'default' })
  key: string;

  @Prop({ type: [PricingTierSchema], default: [] })
  tiers: LandingPricingTier[];

  @Prop({ type: [CompareRowSchema], default: [] })
  compareRows: LandingPricingCompareRow[];
}

export const LandingPricingSchema = SchemaFactory.createForClass(LandingPricing);
