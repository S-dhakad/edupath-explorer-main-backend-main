export declare const ADMIN_OFFLINE_PAYMENT_METHODS: readonly ["cash", "upi", "bank_transfer", "card", "other"];
export type AdminOfflinePaymentMethod = (typeof ADMIN_OFFLINE_PAYMENT_METHODS)[number];
export declare class AdminCreatePlanSaleDto {
    fullName: string;
    email: string;
    dateOfBirth: string;
    contactNumber: string;
    promoCode: string;
    planId: string;
    paymentMethod: AdminOfflinePaymentMethod;
    paymentReference?: string;
    adminNote?: string;
}
