import { KycService } from './kyc.service';
import { KycStatus } from './schemas/kyc.schema';
export declare class KycController {
    private readonly svc;
    constructor(svc: KycService);
    submit(user: any, body: any, files: {
        aadharImage?: any[];
        panImage?: any[];
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/kyc.schema").KycDocument, {}, {}> & import("./schemas/kyc.schema").Kyc & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    status(user: any): Promise<(import("mongoose").FlattenMaps<import("./schemas/kyc.schema").KycDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        status: string;
    }>;
    adminList(status?: KycStatus, page?: string, limit?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./schemas/kyc.schema").KycDocument, {}, {}> & import("./schemas/kyc.schema").Kyc & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    decide(id: string, body: {
        approve: boolean;
        adminNote?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/kyc.schema").KycDocument, {}, {}> & import("./schemas/kyc.schema").Kyc & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
