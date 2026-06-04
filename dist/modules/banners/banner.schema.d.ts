import { Document } from 'mongoose';
export type BannerDocument = Banner & Document;
export declare class Banner {
    title: string;
    imageUrl: string;
    linkUrl: string;
    order: number;
    active: boolean;
}
export declare const BannerSchema: import("mongoose").Schema<Banner, import("mongoose").Model<Banner, any, any, any, Document<unknown, any, Banner, any, {}> & Banner & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Banner, Document<unknown, {}, import("mongoose").FlatRecord<Banner>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Banner> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
