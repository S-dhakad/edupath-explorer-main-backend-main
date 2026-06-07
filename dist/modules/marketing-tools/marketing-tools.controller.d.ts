import { MarketingToolsService } from './marketing-tools.service';
export declare class MarketingToolsController {
    private svc;
    constructor(svc: MarketingToolsService);
    list(): Promise<(import("mongoose").FlattenMaps<import("./marketing-tool.schema").MarketingToolDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    all(): Promise<(import("mongoose").FlattenMaps<import("./marketing-tool.schema").MarketingToolDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./marketing-tool.schema").MarketingToolDocument, {}, {}> & import("./marketing-tool.schema").MarketingTool & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Partial<any>): Promise<import("mongoose").Document<unknown, {}, import("./marketing-tool.schema").MarketingToolDocument, {}, {}> & import("./marketing-tool.schema").MarketingTool & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
