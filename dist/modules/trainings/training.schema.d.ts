import { Document } from 'mongoose';
export type TrainingDocument = Training & Document;
export declare class Training {
    title: string;
    description: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    duration: string;
    lessonCount: number;
    rating: number;
    order: number;
    active: boolean;
}
export declare const TrainingSchema: import("mongoose").Schema<Training, import("mongoose").Model<Training, any, any, any, Document<unknown, any, Training, any, {}> & Training & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Training, Document<unknown, {}, import("mongoose").FlatRecord<Training>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Training> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
