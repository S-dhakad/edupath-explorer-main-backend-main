import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LandingHeroDocument = LandingHero & Document;

const SlideSchema = {
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  highlight: { type: String, required: true },
  suffix: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  videoUrl: { type: String },
};

const VisualMetaSchema = {
  chip: { type: String, required: true },
  metricLabel: { type: String, required: true },
  metricValue: { type: String, required: true },
  metricHint: { type: String, required: true },
};

const StatCardSchema = {
  key: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, required: true },
  label: { type: String, required: true },
};

const OfferSchema = {
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, required: true },
  tone: { type: String, enum: ['primary', 'accent', 'dark'], required: true },
};

@Schema({ timestamps: true, collection: 'landingHero' })
export class LandingHero {
  @Prop({ unique: true, default: 'default' })
  key: string;

  @Prop({ type: [SlideSchema], default: [] })
  slides: Array<{
    eyebrow: string;
    title: string;
    highlight: string;
    suffix: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
  }>;

  @Prop({ type: [String], default: [] })
  trustPills: string[];

  @Prop({ default: 'New cohorts every Monday' })
  announcementBadge: string;

  @Prop({ type: [VisualMetaSchema], default: [] })
  visualMeta: Array<{
    chip: string;
    metricLabel: string;
    metricValue: string;
    metricHint: string;
  }>;

  @Prop({ default: '₹500 / referral' })
  referralBonusLabel: string;

  @Prop({ type: [StatCardSchema], default: [] })
  statCards: Array<{
    key: string;
    value: number;
    suffix: string;
    label: string;
  }>;

  @Prop({ type: [OfferSchema], default: [] })
  offers: Array<{
    id: string;
    title: string;
    subtitle: string;
    cta: string;
    tone: 'primary' | 'accent' | 'dark';
  }>;
}

export const LandingHeroSchema = SchemaFactory.createForClass(LandingHero);
