export declare const DEFAULT_COUPON_OWNER_PCT = 70;
export declare const DEFAULT_PLATFORM_PCT = 20;
export declare const DEFAULT_DIRECT_PARENT_PCT = 10;
export declare const DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT = 40;
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum AffiliateRank {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export declare enum WithdrawalStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    APPROVED = "approved",
    REJECTED = "rejected",
    PAID = "paid"
}
export declare enum PayoutProviderStatus {
    QUEUED = "queued",
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    FAILED = "failed",
    REVERSED = "reversed"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum WalletTransactionType {
    COURSE_PURCHASE_DEBIT = "course_purchase_debit",
    AFFILIATE_COMMISSION_ACTIVE = "affiliate_commission_active",
    AFFILIATE_COMMISSION_PASSIVE = "affiliate_commission_passive",
    PLATFORM_FEE = "platform_fee",
    REFUND = "refund",
    WITHDRAWAL_PENDING = "withdrawal_pending",
    WITHDRAWAL_COMPLETED = "withdrawal_completed",
    WITHDRAWAL_REJECTED = "withdrawal_rejected",
    ADJUSTMENT = "adjustment"
}
export declare enum NotificationType {
    NEW_REFERRAL = "new_referral",
    NEW_SALE = "new_sale",
    WITHDRAWAL_APPROVED = "withdrawal_approved",
    WITHDRAWAL_REJECTED = "withdrawal_rejected",
    WITHDRAWAL_REQUESTED = "withdrawal_requested",
    COURSE_PURCHASED = "course_purchased",
    COUPON_USED = "coupon_used",
    SYSTEM = "system"
}
