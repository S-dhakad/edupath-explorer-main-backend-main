import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrainingDocument = Training & Document;

@Schema({ timestamps: true, collection: 'affiliateTrainings' })
export class Training {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ trim: true })
  thumbnailUrl?: string;

  @Prop({ trim: true })
  videoUrl?: string;

  /** Display label e.g. "2.5 Hours" */
  @Prop({ default: '1 Hour', trim: true })
  duration: string;

  @Prop({ default: 0, min: 0 })
  lessonCount: number;

  @Prop({ default: 4.8, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  active: boolean;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
