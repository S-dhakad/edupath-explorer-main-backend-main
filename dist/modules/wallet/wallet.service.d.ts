import { Connection } from 'mongoose';
import { WalletRepository } from './wallet.repository';
export declare class WalletService {
    private readonly repo;
    private readonly connection;
    constructor(repo: WalletRepository, connection: Connection);
    getOrCreate(userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/wallet.schema").WalletDocument, {}, {}> & import("./schemas/wallet.schema").Wallet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getWallet(userId: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/wallet.schema").WalletDocument, {}, {}> & import("./schemas/wallet.schema").Wallet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    creditAffiliate(userId: string, amount: number, incomeType: 'active' | 'passive', ctx: {
        purchaseId: string;
        meta?: Record<string, unknown>;
    }): Promise<void>;
    listForUser(userId: string, page?: number, limit?: number): Promise<{
        items: (import("mongoose").FlattenMaps<import("./schemas/wallet-transaction.schema").WalletTransactionDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
