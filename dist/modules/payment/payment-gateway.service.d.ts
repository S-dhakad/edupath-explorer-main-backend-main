import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
export type RazorpayVerifyDto = {
    paymentId: string;
    orderId: string;
    razorpayPaymentId: string;
    signature: string;
};
export declare class PaymentGatewayService {
    private config;
    private paymentModel;
    private readonly logger;
    private razorpayClient;
    constructor(config: ConfigService, paymentModel: Model<PaymentDocument>);
    private isRazorpayConfigured;
    private getRazorpayClient;
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
        amount: string | number;
        message: string;
    }>;
    verifyPaymentSignature(orderId: string, razorpayPaymentId: string, signature: string): boolean;
    verifyWebhookSignature(body: string, signature: string): boolean;
    confirmRazorpayPayment(dto: RazorpayVerifyDto): Promise<import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    confirmGuestRazorpayPayment(dto: RazorpayVerifyDto): Promise<import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markCompletedByExternal(provider: 'stripe' | 'razorpay', externalId: string): Promise<import("mongoose").Document<unknown, {}, PaymentDocument, {}, {}> & Payment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    logWebhook(provider: string, body: unknown): void;
}
