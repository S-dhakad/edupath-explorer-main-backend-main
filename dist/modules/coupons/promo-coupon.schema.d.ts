import { HydratedDocument } from 'mongoose';
export type PromoCouponDocument = HydratedDocument<PromoCoupon>;
export declare class PromoCoupon {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase: number;
    maxUsage: number;
    usedCount: number;
    expiresAt?: Date;
    active: boolean;
}
export declare const PromoCouponSchema: import("mongoose").Schema<PromoCoupon, import("mongoose").Model<PromoCoupon, any, any, any, import("mongoose").Document<unknown, any, PromoCoupon, any, {}> & PromoCoupon & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PromoCoupon, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PromoCoupon>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PromoCoupon> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
