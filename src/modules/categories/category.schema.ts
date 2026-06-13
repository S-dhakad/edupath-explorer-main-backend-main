import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: 0 })
  order: number;

  /** Cover image for My Courses category tiles (admin upload / S3 URL) */
  @Prop({ default: '', trim: true })
  imageUrl: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
