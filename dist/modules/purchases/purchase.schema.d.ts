import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../common/constants/app.constants';
export type PurchaseDocument = Purchase & Document;
export declare class Purchase {
    courseId: Types.ObjectId;
    buyerId: Types.ObjectId;
    couponUsed: string;
    amount: number;
    currency: string;
    paymentStatus: PaymentStatus;
    paymentId: Types.ObjectId | null;
    commissionsDistributed: boolean;
    courseSnapshot: Record<string, unknown>;
}
export declare const PurchaseSchema: import("mongoose").Schema<Purchase, import("mongoose").Model<Purchase, any, any, any, Document<unknown, any, Purchase, any, {}> & Purchase & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Purchase, Document<unknown, {}, import("mongoose").FlatRecord<Purchase>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Purchase> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
