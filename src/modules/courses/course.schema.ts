import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const LessonSubSchema = {
  title: { type: String, required: true },
  slug: { type: String },
  videoUrl: { type: String },
  durationSec: { type: Number, default: 0 },
  freePreview: { type: Boolean, default: false },
  notes: { type: String },
  order: { type: Number, default: 0 },
};

const ModuleSubSchema = {
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  lessons: { type: [LessonSubSchema], default: [] },
};

export type CourseDocument = Course & Document;

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop()
  shortDescription: string;

  /** Full description for the course detail page. */
  @Prop()
  fullDescription: string;

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop()
  language: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  subcategoryId: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  originalPrice: number;

  @Prop({ default: 0 })
  discountPrice: number;

  @Prop({ default: 0 })
  offerPercent: number;

  @Prop({ default: true })
  couponApplicable: boolean;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  bannerUrl: string;

  @Prop()
  introVideoUrl: string;

  @Prop({ type: [String], default: [] })
  previewVideoUrls: string[];

  @Prop()
  trailerUrl: string;

  @Prop({ type: [String], default: [] })
  pdfAttachmentUrls: string[];

  @Prop({ type: [ModuleSubSchema], default: [] })
  modules: Array<{
    title: string;
    order: number;
    lessons: Array<{
      title: string;
      slug?: string;
      videoUrl?: string;
      durationSec?: number;
      freePreview?: boolean;
      notes?: string;
      order?: number;
    }>;
  }>;

  @Prop()
  instructorName: string;

  @Prop()
  instructorBio: string;

  @Prop({ type: Object, default: {} })
  instructorSocial: Record<string, string>;

  @Prop()
  instructorImageUrl: string;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  ratingAvg: number;

  @Prop({ default: 0 })
  ratingCount: number;

  /** Homepage / hero carousel */
  @Prop({ default: false })
  featuredOnHero: boolean;

  @Prop({ default: 0 })
  heroOrder: number;

  @Prop({ default: 'Intermediate' })
  level: string;

  /** e.g. "32h" — shown on marketing cards */
  @Prop()
  durationLabel: string;

  @Prop({ default: 0 })
  lessonCount: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ title: 'text', shortDescription: 'text', tags: 'text' });
CourseSchema.index({ categoryId: 1, isPublished: 1 });
CourseSchema.index({ featuredOnHero: 1, heroOrder: 1, isPublished: 1 });
