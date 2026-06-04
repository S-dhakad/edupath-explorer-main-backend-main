import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { PlanSale, PlanSaleDocument, PlanSaleStatus } from './plan-sale.schema';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { UsersService } from '../users/users.service';
import { PlanDocument } from '../plans/plan.schema';
import { PlansService } from '../plans/plans.service';
import { MailService } from '../mail/mail.service';
import { PaymentDocument } from '../payment/schemas/payment.schema';
import { PaymentGatewayService } from '../payment/payment-gateway.service';
import { RevenueDistributionService } from '../commission/revenue-distribution.service';
import { PromoCouponsService } from '../coupons/promo-coupons.service';
import { SettingsService } from '../settings/settings.service';
import { UserDocument } from '../users/user.schema';
export declare class PlanSalesService {
    private readonly saleModel;
    private readonly planModel;
    private readonly paymentModel;
    private readonly usersService;
    private readonly plansService;
    private readonly mail;
    private readonly config;
    private readonly paymentGateway;
    private readonly revenueDistribution;
    private readonly promoCoupons;
    private readonly settingsService;
    private readonly logger;
    constructor(saleModel: Model<PlanSaleDocument>, planModel: Model<PlanDocument>, paymentModel: Model<PaymentDocument>, usersService: UsersService, plansService: PlansService, mail: MailService, config: ConfigService, paymentGateway: PaymentGatewayService, revenueDistribution: RevenueDistributionService, promoCoupons: PromoCouponsService, settingsService: SettingsService);
    quoteCheckout(planId: string, promoCode?: string): Promise<{
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
        promoOwner: UserDocument | undefined;
        discountLabel: string | undefined;
        attributionOnly: boolean;
        planId: string;
        planName: string;
        listPrice: number;
        memberPromoDiscountPercent: number;
    }>;
    private assertMemberPromoOwnerActive;
    private buildCommissionPreview;
    private resolvePlanPricing;
    initiateAffiliateCheckout(sellerId: string, dto: CreatePlanSaleDto): Promise<{
        sale: PlanSaleDocument;
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
    initiateSelfCheckout(buyerUserId: string, dto: PurchasePlanSelfDto): Promise<{
        sale: PlanSaleDocument;
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
    finalizeCheckout(actorUserId: string, saleId: string, paymentId: string): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    completeSaleByPaymentId(paymentId: string): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    create(sellerId: string, dto: CreatePlanSaleDto): Promise<{
        sale: PlanSaleDocument;
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
    purchaseSelf(buyerUserId: string, dto: PurchasePlanSelfDto): Promise<{
        sale: PlanSaleDocument;
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
    } | {
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    private checkoutResponse;
    private sellerSaleFilter;
    listMine(sellerId: string): Promise<{
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
    listAll(filter: {
        status?: PlanSaleStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<PlanSaleDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    markPaid(id: string, adminNote?: string): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
        sale: import("mongoose").Document<unknown, {}, PlanSaleDocument, {}, {}> & PlanSale & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
