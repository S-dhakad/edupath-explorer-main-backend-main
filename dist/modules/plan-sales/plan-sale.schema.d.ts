import { Document, Types } from 'mongoose';
export type PlanSaleDocument = PlanSale & Document;
export declare enum PlanSaleStatus {
    PENDING_PAYMENT = "pending_payment",
    PAID = "paid"
}
export declare class PlanSale {
    sellerId: Types.ObjectId;
    buyerUserId: Types.ObjectId;
    planId: Types.ObjectId;
    fullName: string;
    email: string;
    age: number;
    dateOfBirth: Date;
    contactNumber: string;
    promoCode: string;
    status: PlanSaleStatus;
    adminNote: string;
    paymentId: Types.ObjectId | null;
    commissionsDistributed: boolean;
    buyerTempPassword: string;
}
export declare const PlanSaleSchema: import("mongoose").Schema<PlanSale, import("mongoose").Model<PlanSale, any, any, any, Document<unknown, any, PlanSale, any, {}> & PlanSale & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlanSale, Document<unknown, {}, import("mongoose").FlatRecord<PlanSale>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PlanSale> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
