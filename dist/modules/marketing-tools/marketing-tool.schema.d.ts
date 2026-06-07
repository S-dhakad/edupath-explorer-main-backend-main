import { Document } from 'mongoose';
export type MarketingToolDocument = MarketingTool & Document;
export declare class MarketingTool {
    title: string;
    description: string;
    icon: string;
    assetCount: number;
    downloadUrl?: string;
    previewUrl?: string;
    tone: string;
    order: number;
    active: boolean;
}
export declare const MarketingToolSchema: import("mongoose").Schema<MarketingTool, import("mongoose").Model<MarketingTool, any, any, any, Document<unknown, any, MarketingTool, any, {}> & MarketingTool & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MarketingTool, Document<unknown, {}, import("mongoose").FlatRecord<MarketingTool>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<MarketingTool> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
