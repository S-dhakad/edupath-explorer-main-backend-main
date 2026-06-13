import { RawBodyRequest } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PlanSalesService } from '../plan-sales/plan-sales.service';
export declare class PaymentsController {
    private readonly payments;
    private readonly planSales;
    constructor(payments: PaymentGatewayService, planSales: PlanSalesService);
    stripeOrder(req: any, body: {
        courseId?: string;
        planId?: string;
        amount: number;
        couponCode?: string;
    }): Promise<{
        payment: import("mongoose").Document<unknown, {}, import("./schemas/payment.schema").PaymentDocument, {}, {}> & import("./schemas/payment.schema").Payment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        clientSecret: string;
        message: string;
    }>;
    rzpOrder(req: any, body: {
        courseId?: string;
        planId?: string;
        amount: number;
        couponCode?: string;
    }): Promise<{
        payment: import("mongoose").Document<unknown, {}, import("./schemas/payment.schema").PaymentDocument, {}, {}> & import("./schemas/payment.schema").Payment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        keyId: string;
        orderId: string;
        amount: string | number;
        message: string;
    }>;
    rzpVerify(body: {
        paymentId: string;
        orderId: string;
        razorpayPaymentId: string;
        signature: string;
    }): Promise<{
        payment: {
            _id: import("mongoose").Types.ObjectId;
            status: import("../../common/constants/app.constants").PaymentStatus;
            orderId: string;
        };
        verified: boolean;
    }>;
    publicRzpVerify(body: {
        paymentId: string;
        orderId: string;
        razorpayPaymentId: string;
        signature: string;
    }): Promise<{
        payment: {
            _id: import("mongoose").Types.ObjectId;
            status: import("../../common/constants/app.constants").PaymentStatus;
            orderId: string;
        };
        verified: boolean;
    }>;
    stripeWebhook(req: RawBodyRequest<Request>, sig: string): {
        received: boolean;
    };
    rzpWebhook(req: RawBodyRequest<Request> & {
        rawBody?: Buffer;
    }, signature: string, body: any): Promise<{
        received: boolean;
    }>;
}
