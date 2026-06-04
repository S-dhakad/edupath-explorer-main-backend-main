import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
export declare class PaymentGatewayService {
    private config;
    private paymentModel;
    private readonly logger;
    constructor(config: ConfigService, paymentModel: Model<PaymentDocument>);
    createStripeLikeOrder(payerUserId: string, amount: number, opts: {
        courseId?: string;
        planId?: string;
        couponCode?: string;
    }): Promise<{
        payment: import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        clientSecret: string;
        message: string;
    }>;
    createRazorpayLikeOrder(payerUserId: string, amount: number, opts: {
        courseId?: string;
        planId?: string;
        couponCode?: string;
    }): Promise<{
        payment: import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        keyId: string;
        orderId: string;
        message: string;
    }>;
    markCompletedByExternal(provider: 'stripe' | 'razorpay', externalId: string): Promise<import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    logWebhook(provider: string, body: unknown): void;
}
