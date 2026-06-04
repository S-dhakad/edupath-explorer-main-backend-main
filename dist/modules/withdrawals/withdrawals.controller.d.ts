import { RazorpayPayoutService } from '../payout/razorpay-payout.service';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalStatus } from '../../common/constants/app.constants';
export declare class WithdrawalsController {
    private readonly svc;
    private readonly razorpayPayout;
    constructor(svc: WithdrawalsService, razorpayPayout: RazorpayPayoutService);
    request(user: any, body: any): Promise<import("./withdrawal.schema").WithdrawalDocument>;
    mine(user: any): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./withdrawal.schema").WithdrawalDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./withdrawal.schema").WithdrawalDocument, {}, {}> & import("./withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("./withdrawal.schema").WithdrawalDocument, "find", {}>;
    adminList(status?: WithdrawalStatus, page?: string, limit?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("./withdrawal.schema").WithdrawalDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    decide(admin: {
        _id: {
            toString(): string;
        };
    }, id: string, body: {
        approve: boolean;
        adminNote?: string;
    }): Promise<import("./withdrawal.schema").WithdrawalDocument>;
    syncPayout(id: string): Promise<import("./withdrawal.schema").WithdrawalDocument | (import("mongoose").Document<unknown, {}, import("./withdrawal.schema").WithdrawalDocument, {}, {}> & import("./withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })>;
    razorpayxWebhook(req: {
        rawBody?: Buffer;
        body?: unknown;
    }, signature: string, body: unknown): Promise<{
        ok: boolean;
    } | {
        ok: boolean;
        error: string;
    }>;
}
