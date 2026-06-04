import { BannersService } from './banners.service';
export declare class BannersController {
    private svc;
    constructor(svc: BannersService);
    publicList(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./banner.schema").BannerDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./banner.schema").BannerDocument, {}, {}> & import("./banner.schema").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./banner.schema").BannerDocument, "find", {}>;
    all(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./banner.schema").BannerDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./banner.schema").BannerDocument, {}, {}> & import("./banner.schema").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./banner.schema").BannerDocument, "find", {}>;
    create(body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./banner.schema").BannerDocument, {}, {}> & import("./banner.schema").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./banner.schema").BannerDocument, {}, {}> & import("./banner.schema").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
