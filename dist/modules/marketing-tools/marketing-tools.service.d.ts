import { Model } from 'mongoose';
import { MarketingTool, MarketingToolDocument } from './marketing-tool.schema';
export declare class MarketingToolsService {
    private model;
    constructor(model: Model<MarketingToolDocument>);
    ensureSeeded(): Promise<void>;
    publicList(): Promise<(import("mongoose").FlattenMaps<MarketingToolDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): Promise<(import("mongoose").FlattenMaps<MarketingToolDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(d: Partial<MarketingTool>): Promise<import("mongoose").Document<unknown, {}, MarketingToolDocument, {}, {}> & MarketingTool & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, patch: Partial<MarketingTool>): Promise<import("mongoose").Document<unknown, {}, MarketingToolDocument, {}, {}> & MarketingTool & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
