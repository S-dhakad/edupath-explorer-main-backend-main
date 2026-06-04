import { Document, Types } from 'mongoose';
export type CommissionDocument = Commission & Document;
export declare class Commission {
    purchaseId: Types.ObjectId | null;
    planSaleId: Types.ObjectId | null;
    beneficiaryUserId: Types.ObjectId | null;
    beneficiaryRole: 'coupon_owner' | 'direct_parent' | 'platform';
    incomeCategory: 'active' | 'passive' | 'platform';
    amount: number;
    currency: string;
    percentApplied: number;
}
export declare const CommissionSchema: import("mongoose").Schema<Commission, import("mongoose").Model<Commission, any, any, any, Document<unknown, any, Commission, any, {}> & Commission & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Commission, Document<unknown, {}, import("mongoose").FlatRecord<Commission>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Commission> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
