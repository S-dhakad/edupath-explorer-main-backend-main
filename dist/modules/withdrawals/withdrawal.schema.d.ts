import { Document, Types } from 'mongoose';
import { WithdrawalStatus } from '../../common/constants/app.constants';
export type WithdrawalDocument = Withdrawal & Document;
export declare class Withdrawal {
    userId: Types.ObjectId;
    amount: number;
    status: WithdrawalStatus;
    method: 'upi' | 'bank' | 'paypal';
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
    paypalEmail: string;
    adminNote: string;
    paidAt?: Date;
    processedBy?: Types.ObjectId;
    payoutProvider?: string;
    razorpayContactId?: string;
    razorpayFundAccountId?: string;
    razorpayPayoutId?: string;
    payoutProviderStatus?: string;
    payoutError?: string;
    payoutInitiatedAt?: Date;
}
export declare const WithdrawalSchema: import("mongoose").Schema<Withdrawal, import("mongoose").Model<Withdrawal, any, any, any, Document<unknown, any, Withdrawal, any, {}> & Withdrawal & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Withdrawal, Document<unknown, {}, import("mongoose").FlatRecord<Withdrawal>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Withdrawal> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
