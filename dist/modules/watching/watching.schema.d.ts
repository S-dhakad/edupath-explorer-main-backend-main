import { Document, Types } from 'mongoose';
export type WatchingDocument = Watching & Document;
export declare class Watching {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    videoIndex: number;
    lessonKey: string;
    lastPositionSec: number;
    progressPercent: number;
    completed: boolean;
    watchedAt: Date;
}
export declare const WatchingSchema: import("mongoose").Schema<Watching, import("mongoose").Model<Watching, any, any, any, Document<unknown, any, Watching, any, {}> & Watching & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Watching, Document<unknown, {}, import("mongoose").FlatRecord<Watching>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Watching> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
