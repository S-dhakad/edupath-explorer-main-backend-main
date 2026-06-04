import { PlanSalesService } from './plan-sales.service';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { FinalizePlanSaleDto } from './dto/finalize-plan-sale.dto';
import { QuotePlanDto } from './dto/quote-plan.dto';
import { PlanSaleStatus } from './plan-sale.schema';
export declare class PlanSalesController {
    private readonly svc;
    constructor(svc: PlanSalesService);
    quote(dto: QuotePlanDto): Promise<{
        tax: number;
        total: number;
        commissionPreview: {
            paidAmount: number;
            promoOwnerName: string;
            promoOwnerId: any;
            uplineId: string;
            sellerShare: number;
            parentShare: number;
            platformShare: number;
            sellerPercent: number;
            parentPercent: number;
            platformPercent: number;
        };
        subtotal: number;
        discountAmount: number;
        finalSubtotal: number;
        promoCode: string | undefined;
        kind: "admin_coupon" | "member_referral" | null;
        referrerName: string | undefined;
        promoOwner: import("../users/user.schema").UserDocument | undefined;
        discountLabel: string | undefined;
        attributionOnly: boolean;
        planId: string;
        planName: string;
        listPrice: number;
        memberPromoDiscountPercent: number;
    }>;
    create(user: any, dto: CreatePlanSaleDto): Promise<{
        sale: import("./plan-sale.schema").PlanSaleDocument;
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        pricing: {
            subtotal: number;
            discountAmount: number;
            finalSubtotal: number;
            tax: number;
            total: number;
            discountLabel: string;
            attributionOnly: boolean;
        };
        payment: {
            _id: any;
            amount: any;
            status: any;
            orderId: any;
        };
        razorpay: {
            keyId: any;
            orderId: any;
            amount: number;
            currency: string;
        };
        buyerEmail: string;
        message: string;
    }>;
    checkoutSelf(user: any, dto: PurchasePlanSelfDto): Promise<{
        sale: import("./plan-sale.schema").PlanSaleDocument;
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        pricing: {
            subtotal: number;
            discountAmount: number;
            finalSubtotal: number;
            tax: number;
            total: number;
            discountLabel: string;
            attributionOnly: boolean;
        };
        payment: {
            _id: any;
            amount: any;
            status: any;
            orderId: any;
        };
        razorpay: {
            keyId: any;
            orderId: any;
            amount: number;
            currency: string;
        };
        buyerEmail: string;
        message: string;
    }>;
    finalize(user: any, dto: FinalizePlanSaleDto): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        plan?: undefined;
        accountActive?: undefined;
        promoUnlocked?: undefined;
        credentialsEmailed?: undefined;
    } | {
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        message: string;
        accountActive: boolean;
        yourPromoCode: string;
        promoUnlocked: boolean;
        credentialsEmailed: boolean;
        alreadyPaid?: undefined;
    }>;
    purchaseSelf(user: any, dto: PurchasePlanSelfDto): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        plan?: undefined;
        accountActive?: undefined;
        promoUnlocked?: undefined;
        credentialsEmailed?: undefined;
    } | {
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        message: string;
        accountActive: boolean;
        yourPromoCode: string;
        promoUnlocked: boolean;
        credentialsEmailed: boolean;
        alreadyPaid?: undefined;
    } | {
        sale: import("./plan-sale.schema").PlanSaleDocument;
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        pricing: {
            subtotal: number;
            discountAmount: number;
            finalSubtotal: number;
            tax: number;
            total: number;
            discountLabel: string;
            attributionOnly: boolean;
        };
        payment: {
            _id: any;
            amount: any;
            status: any;
            orderId: any;
        };
        razorpay: {
            keyId: any;
            orderId: any;
            amount: number;
            currency: string;
        };
        buyerEmail: string;
        message: string;
    }>;
    mine(user: any): Promise<{
        _id: any;
        fullName: any;
        email: any;
        contactNumber: any;
        age: any;
        dateOfBirth: any;
        promoCode: any;
        status: any;
        adminNote: any;
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        buyer: {
            _id: any;
            name: any;
            email: any;
            accountActive: any;
            phone: any;
        };
        password: any;
        createdAt: any;
        updatedAt: any;
        source: string;
    }[]>;
    adminList(status?: PlanSaleStatus, page?: string, limit?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("./plan-sale.schema").PlanSaleDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    markPaid(id: string, body: {
        adminNote?: string;
    }): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        plan?: undefined;
        accountActive?: undefined;
        promoUnlocked?: undefined;
        credentialsEmailed?: undefined;
    } | {
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        message: string;
        accountActive: boolean;
        yourPromoCode: string;
        promoUnlocked: boolean;
        credentialsEmailed: boolean;
        alreadyPaid?: undefined;
    }>;
}
