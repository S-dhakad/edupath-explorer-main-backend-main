import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../../common/constants/app.constants';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop()
  body: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Object })
  data: Record<string, unknown>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
