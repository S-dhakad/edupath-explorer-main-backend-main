import { Document, Types } from 'mongoose';
export type KycDocument = Kyc & Document;
export declare enum KycStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class Kyc {
    userId: Types.ObjectId;
    aadharNumber: string;
    panNumber: string;
    aadharImage: string;
    panImage: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    status: KycStatus;
    adminNote: string;
    razorpayContactId?: string;
    razorpayFundAccountId?: string;
}
export declare const KycSchema: import("mongoose").Schema<Kyc, import("mongoose").Model<Kyc, any, any, any, Document<unknown, any, Kyc, any, {}> & Kyc & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Kyc, Document<unknown, {}, import("mongoose").FlatRecord<Kyc>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Kyc> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
