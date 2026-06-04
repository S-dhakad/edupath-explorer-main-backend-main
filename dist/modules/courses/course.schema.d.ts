import { Document, Types } from 'mongoose';
export type CourseDocument = Course & Document;
export declare class Course {
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    highlights: string[];
    requirements: string[];
    benefits: string[];
    language: string;
    categoryId: Types.ObjectId | null;
    subcategoryId: Types.ObjectId | null;
    tags: string[];
    originalPrice: number;
    discountPrice: number;
    offerPercent: number;
    couponApplicable: boolean;
    thumbnailUrl: string;
    bannerUrl: string;
    introVideoUrl: string;
    previewVideoUrls: string[];
    trailerUrl: string;
    pdfAttachmentUrls: string[];
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
    instructorName: string;
    instructorBio: string;
    instructorSocial: Record<string, string>;
    instructorImageUrl: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    videos: string[];
    images: string[];
    price: number;
    uploadedBy: Types.ObjectId;
    isPublished: boolean;
    salesCount: number;
    ratingAvg: number;
    ratingCount: number;
    featuredOnHero: boolean;
    heroOrder: number;
    level: string;
    durationLabel: string;
    lessonCount: number;
}
export declare const CourseSchema: import("mongoose").Schema<Course, import("mongoose").Model<Course, any, any, any, Document<unknown, any, Course, any, {}> & Course & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Course, Document<unknown, {}, import("mongoose").FlatRecord<Course>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Course> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
