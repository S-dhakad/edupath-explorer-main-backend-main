import { Model } from 'mongoose';
import { Banner, BannerDocument } from './banner.schema';
export declare class BannersService {
    private model;
    constructor(model: Model<BannerDocument>);
    create(d: Partial<Banner>): Promise<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    active(): import("mongoose").Query<(import("mongoose").FlattenMaps<BannerDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, BannerDocument, "find", {}>;
    all(): import("mongoose").Query<(import("mongoose").FlattenMaps<BannerDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, BannerDocument, "find", {}>;
    update(id: string, patch: Partial<Banner>): Promise<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
