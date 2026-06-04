import { Document, Types } from 'mongoose';
import { WalletTransactionType } from '../../../common/constants/app.constants';
export type WalletTransactionDocument = WalletTransaction & Document;
export declare class WalletTransaction {
    userId: Types.ObjectId;
    purchaseId: Types.ObjectId | null;
    withdrawalId: Types.ObjectId | null;
    type: WalletTransactionType;
    amount: number;
    currency: string;
    balanceAfter: number;
    meta: Record<string, unknown>;
}
export declare const WalletTransactionSchema: import("mongoose").Schema<WalletTransaction, import("mongoose").Model<WalletTransaction, any, any, any, Document<unknown, any, WalletTransaction, any, {}> & WalletTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WalletTransaction, Document<unknown, {}, import("mongoose").FlatRecord<WalletTransaction>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WalletTransaction> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
