import { PlanSalesService } from './plan-sales.service';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { CreateGuestPlanCheckoutDto } from './dto/create-guest-plan-checkout.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { FinalizePlanSaleDto } from './dto/finalize-plan-sale.dto';
import { QuotePlanDto } from './dto/quote-plan.dto';
import { PublicQuotePlanDto } from './dto/public-quote-plan.dto';
import { AdminQuotePlanDto } from './dto/admin-quote-plan.dto';
import { AdminCreatePlanSaleDto } from './dto/admin-create-plan-sale.dto';
import { PlanSaleStatus } from './plan-sale.schema';
export declare class PlanSalesController {
    private readonly svc;
    constructor(svc: PlanSalesService);
    quote(user: any, dto: QuotePlanDto): Promise<{
        tax: number;
        total: number;
        commissionPreview: {
            paidAmount: number;
            commissionBase: number;
            cappedToSellerPlan: boolean;
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
        targetPrice: number;
        upgradeCredit: number;
        isUpgrade: boolean;
        samePlan: boolean;
        isDowngrade: boolean;
        currentPlan: {
            id: any;
            name: string;
            tierId: any;
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
        originalPrice: number;
        promoPrice: any;
        listPrice: number;
        memberPromoDiscountPercent: number;
    }>;
    publicQuote(dto: PublicQuotePlanDto): Promise<{
        tax: number;
        total: number;
        commissionPreview: {
            paidAmount: number;
            commissionBase: number;
            cappedToSellerPlan: boolean;
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
        targetPrice: number;
        upgradeCredit: number;
        isUpgrade: boolean;
        samePlan: boolean;
        isDowngrade: boolean;
        currentPlan: {
            id: any;
            name: string;
            tierId: any;
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
        originalPrice: number;
        promoPrice: any;
        listPrice: number;
        memberPromoDiscountPercent: number;
    }>;
    publicCheckout(dto: CreateGuestPlanCheckoutDto): Promise<{
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
            targetPrice: any;
            upgradeCredit: any;
            isUpgrade: any;
            currentPlan: any;
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
    publicFinalize(dto: FinalizePlanSaleDto): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        planActive: boolean;
        alreadyPendingApproval?: undefined;
        pendingAdminApproval?: undefined;
        buyerCredentials?: undefined;
        plan?: undefined;
        accountActive?: undefined;
        credentialsEmailed?: undefined;
    } | {
        alreadyPendingApproval: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        pendingAdminApproval: boolean;
        planActive: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl?: undefined;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        plan?: undefined;
        accountActive?: undefined;
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
        pendingAdminApproval: boolean;
        planActive: boolean;
        accountActive: boolean;
        credentialsEmailed: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl: string;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        alreadyPendingApproval?: undefined;
    }>;
    upgradeOptions(user: any): Promise<{
        currentPlan: any;
        upgrades: Array<Record<string, unknown>>;
        message: string;
        uplinePromoCode?: undefined;
    } | {
        currentPlan: {
            planId: any;
            tierId: any;
            name: string;
            price: number;
            promoPrice: any;
            credit: number;
        };
        upgrades: {
            planId: any;
            tierId: any;
            name: string;
            price: number;
            promoPrice: any;
            targetPrice: any;
            upgradeCredit: number;
            upgradeTotal: any;
            features: string[];
        }[];
        uplinePromoCode: any;
        message?: undefined;
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
            targetPrice: any;
            upgradeCredit: any;
            isUpgrade: any;
            currentPlan: any;
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
            targetPrice: any;
            upgradeCredit: any;
            isUpgrade: any;
            currentPlan: any;
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
        planActive: boolean;
        alreadyPendingApproval?: undefined;
        pendingAdminApproval?: undefined;
        buyerCredentials?: undefined;
        plan?: undefined;
        accountActive?: undefined;
        credentialsEmailed?: undefined;
    } | {
        alreadyPendingApproval: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        pendingAdminApproval: boolean;
        planActive: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl?: undefined;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        plan?: undefined;
        accountActive?: undefined;
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
        pendingAdminApproval: boolean;
        planActive: boolean;
        accountActive: boolean;
        credentialsEmailed: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl: string;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        alreadyPendingApproval?: undefined;
    }>;
    purchaseSelf(user: any, dto: PurchasePlanSelfDto): Promise<{
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
            targetPrice: any;
            upgradeCredit: any;
            isUpgrade: any;
            currentPlan: any;
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
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        planActive: boolean;
        alreadyPendingApproval?: undefined;
        pendingAdminApproval?: undefined;
        buyerCredentials?: undefined;
        plan?: undefined;
        accountActive?: undefined;
        credentialsEmailed?: undefined;
    } | {
        alreadyPendingApproval: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        pendingAdminApproval: boolean;
        planActive: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl?: undefined;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        plan?: undefined;
        accountActive?: undefined;
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
        pendingAdminApproval: boolean;
        planActive: boolean;
        accountActive: boolean;
        credentialsEmailed: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl: string;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        alreadyPendingApproval?: undefined;
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
    adminQuote(dto: AdminQuotePlanDto): Promise<{
        tax: number;
        total: number;
        commissionPreview: {
            paidAmount: number;
            commissionBase: number;
            cappedToSellerPlan: boolean;
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
        targetPrice: number;
        upgradeCredit: number;
        isUpgrade: boolean;
        samePlan: boolean;
        isDowngrade: boolean;
        currentPlan: {
            id: any;
            name: string;
            tierId: any;
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
        originalPrice: number;
        promoPrice: any;
        listPrice: number;
        memberPromoDiscountPercent: number;
    }>;
    adminSell(user: any, dto: AdminCreatePlanSaleDto): Promise<{
        alreadyPaid: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        yourPromoCode: string;
        message: string;
        planActive: boolean;
        alreadyPendingApproval?: undefined;
        pendingAdminApproval?: undefined;
        buyerCredentials?: undefined;
        plan?: undefined;
        accountActive?: undefined;
        credentialsEmailed?: undefined;
    } | {
        alreadyPendingApproval: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        pendingAdminApproval: boolean;
        planActive: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl?: undefined;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        plan?: undefined;
        accountActive?: undefined;
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
        pendingAdminApproval: boolean;
        planActive: boolean;
        accountActive: boolean;
        credentialsEmailed: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl: string;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        alreadyPendingApproval?: undefined;
    }>;
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
        planActive: boolean;
        alreadyPendingApproval?: undefined;
        pendingAdminApproval?: undefined;
        buyerCredentials?: undefined;
        plan?: undefined;
        accountActive?: undefined;
        credentialsEmailed?: undefined;
    } | {
        alreadyPendingApproval: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
        pendingAdminApproval: boolean;
        planActive: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl?: undefined;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        plan?: undefined;
        accountActive?: undefined;
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
        pendingAdminApproval: boolean;
        planActive: boolean;
        accountActive: boolean;
        credentialsEmailed: boolean;
        buyerCredentials: {
            email: string;
            temporaryPassword: string;
            loginUrl: string;
        };
        alreadyPaid?: undefined;
        yourPromoCode?: undefined;
        alreadyPendingApproval?: undefined;
    }>;
    decide(id: string, body: {
        approve: boolean;
        adminNote?: string;
    }): Promise<{
        sale: import("./plan-sale.schema").PlanSaleDocument;
        plan: {
            _id: any;
            name: any;
            price: any;
        };
        message: string;
        planActive: boolean;
        yourPromoCode: string;
        promoUnlocked: boolean;
        credentialsEmailed: boolean;
    } | {
        rejected: boolean;
        sale: import("mongoose").Document<unknown, {}, import("./plan-sale.schema").PlanSaleDocument, {}, {}> & import("./plan-sale.schema").PlanSale & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
    }>;
}
