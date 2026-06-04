import { Connection, Model, Types } from 'mongoose';
import { Withdrawal, WithdrawalDocument } from './withdrawal.schema';
import { WithdrawalStatus } from '../../common/constants/app.constants';
import { WalletRepository } from '../wallet/wallet.repository';
import { MailService } from '../mail/mail.service';
import { UserDocument } from '../users/user.schema';
import { KycService } from '../kyc/kyc.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RazorpayPayoutService } from '../payout/razorpay-payout.service';
export declare class WithdrawalsService {
    private readonly connection;
    private model;
    private userModel;
    private walletRepo;
    private mail;
    private readonly kycService;
    private readonly notifications;
    private readonly razorpayPayout;
    private readonly logger;
    constructor(connection: Connection, model: Model<WithdrawalDocument>, userModel: Model<UserDocument>, walletRepo: WalletRepository, mail: MailService, kycService: KycService, notifications: NotificationsService, razorpayPayout: RazorpayPayoutService);
    request(userId: string, dto: Partial<Withdrawal>): Promise<WithdrawalDocument>;
    listMine(userId: string): import("mongoose").Query<(import("mongoose").FlattenMaps<WithdrawalDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, WithdrawalDocument, {}, {}> & Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, {}, WithdrawalDocument, "find", {}>;
    listAll(filter: {
        status?: WithdrawalStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<WithdrawalDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    decide(id: string, approve: boolean, adminNote?: string, adminId?: string): Promise<WithdrawalDocument>;
    private initiateBankPayout;
    private finalizeRejected;
    applyPayoutResult(withdrawalId: string, providerStatus: string, razorpayPayoutId?: string, failureReason?: string): Promise<WithdrawalDocument | (import("mongoose").Document<unknown, {}, WithdrawalDocument, {}, {}> & Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })>;
    syncPayoutStatus(withdrawalId: string): Promise<WithdrawalDocument | (import("mongoose").Document<unknown, {}, WithdrawalDocument, {}, {}> & Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })>;
    handleRazorpayWebhook(body: {
        event?: string;
        payload?: {
            payout?: {
                entity?: {
                    id?: string;
                    status?: string;
                    reference_id?: string;
                    failure_reason?: string;
                };
            };
        };
    }): Promise<{
        ok: boolean;
    }>;
    private notifyWithdrawalOutcome;
}
