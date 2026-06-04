import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchingDocument = Watching & Document;

@Schema({ timestamps: true, collection: 'watchHistory' })
export class Watching {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ default: 0 })
  videoIndex: number;

  @Prop()
  lessonKey: string;

  @Prop({ default: 0 })
  lastPositionSec: number;

  @Prop({ default: 0 })
  progressPercent: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: Date.now })
  watchedAt: Date;
}

export const WatchingSchema = SchemaFactory.createForClass(Watching);
WatchingSchema.index({ userId: 1, courseId: 1, lessonKey: 1 });
