import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true, collection: 'banners' })
export class Banner {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  linkUrl: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  active: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
