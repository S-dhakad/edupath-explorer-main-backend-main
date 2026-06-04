import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../common/constants/app.constants';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    payerUserId: Types.ObjectId;
    courseId: Types.ObjectId | null;
    planId: Types.ObjectId | null;
    couponCode: string;
    amount: number;
    currency: string;
    provider: 'stripe' | 'razorpay' | 'manual';
    status: PaymentStatus;
    externalId: string;
    providerPayload: Record<string, unknown>;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Payment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
