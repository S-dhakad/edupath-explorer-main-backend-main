import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarketingToolDocument = MarketingTool & Document;

@Schema({ timestamps: true, collection: 'marketingTools' })
export class MarketingTool {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  /** UI icon key: image | video | file | folder */
  @Prop({ default: 'image', trim: true })
  icon: string;

  @Prop({ default: 0, min: 0 })
  assetCount: number;

  @Prop({ trim: true })
  downloadUrl?: string;

  @Prop({ trim: true })
  previewUrl?: string;

  /** Tailwind gradient/border classes for card styling */
  @Prop({ default: 'from-primary/15 to-transparent border-primary/20', trim: true })
  tone: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  active: boolean;
}

export const MarketingToolSchema = SchemaFactory.createForClass(MarketingTool);
