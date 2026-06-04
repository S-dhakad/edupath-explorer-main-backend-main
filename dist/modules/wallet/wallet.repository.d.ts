import { ClientSession, Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { WalletTransactionDocument } from './schemas/wallet-transaction.schema';
import { WalletTransactionType } from '../../common/constants/app.constants';
export declare class WalletRepository {
    private walletModel;
    private txModel;
    constructor(walletModel: Model<WalletDocument>, txModel: Model<WalletTransactionDocument>);
    findByUserId(userId: string): Promise<import("mongoose").Document<unknown, {}, WalletDocument, {}, {}> & Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    ensureWallet(userId: string, currency?: string, session?: ClientSession): Promise<import("mongoose").Document<unknown, {}, WalletDocument, {}, {}> & Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    adjustAvailable(userId: string, delta: number, type: WalletTransactionType, opts: {
        purchaseId?: string;
        withdrawalId?: string;
        meta?: Record<string, unknown>;
    }, session?: ClientSession): Promise<import("mongoose").Document<unknown, {}, WalletDocument, {}, {}> & Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    moveAvailableToPending(userId: string, amount: number, withdrawalId: string, session?: ClientSession): Promise<import("mongoose").Document<unknown, {}, WalletDocument, {}, {}> & Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    finalizeWithdrawal(userId: string, amount: number, withdrawalId: string, approved: boolean, session?: ClientSession): Promise<import("mongoose").Document<unknown, {}, WalletDocument, {}, {}> & Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listTransactions(userId: string, page: number, limit: number): Promise<(import("mongoose").FlattenMaps<WalletTransactionDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    countTransactions(userId: string): Promise<number>;
}
