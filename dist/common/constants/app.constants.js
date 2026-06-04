"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.WalletTransactionType = exports.PaymentStatus = exports.PayoutProviderStatus = exports.WithdrawalStatus = exports.AffiliateRank = exports.UserRole = exports.DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT = exports.DEFAULT_DIRECT_PARENT_PCT = exports.DEFAULT_PLATFORM_PCT = exports.DEFAULT_COUPON_OWNER_PCT = void 0;
exports.DEFAULT_COUPON_OWNER_PCT = 70;
exports.DEFAULT_PLATFORM_PCT = 20;
exports.DEFAULT_DIRECT_PARENT_PCT = 10;
exports.DEFAULT_MEMBER_PROMO_BUYER_DISCOUNT_PCT = 40;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var AffiliateRank;
(function (AffiliateRank) {
    AffiliateRank["BRONZE"] = "bronze";
    AffiliateRank["SILVER"] = "silver";
    AffiliateRank["GOLD"] = "gold";
    AffiliateRank["PLATINUM"] = "platinum";
})(AffiliateRank || (exports.AffiliateRank = AffiliateRank = {}));
var WithdrawalStatus;
(function (WithdrawalStatus) {
    WithdrawalStatus["PENDING"] = "pending";
    WithdrawalStatus["PROCESSING"] = "processing";
    WithdrawalStatus["APPROVED"] = "approved";
    WithdrawalStatus["REJECTED"] = "rejected";
    WithdrawalStatus["PAID"] = "paid";
})(WithdrawalStatus || (exports.WithdrawalStatus = WithdrawalStatus = {}));
var PayoutProviderStatus;
(function (PayoutProviderStatus) {
    PayoutProviderStatus["QUEUED"] = "queued";
    PayoutProviderStatus["PENDING"] = "pending";
    PayoutProviderStatus["PROCESSING"] = "processing";
    PayoutProviderStatus["PROCESSED"] = "processed";
    PayoutProviderStatus["FAILED"] = "failed";
    PayoutProviderStatus["REVERSED"] = "reversed";
})(PayoutProviderStatus || (exports.PayoutProviderStatus = PayoutProviderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["COURSE_PURCHASE_DEBIT"] = "course_purchase_debit";
    WalletTransactionType["AFFILIATE_COMMISSION_ACTIVE"] = "affiliate_commission_active";
    WalletTransactionType["AFFILIATE_COMMISSION_PASSIVE"] = "affiliate_commission_passive";
    WalletTransactionType["PLATFORM_FEE"] = "platform_fee";
    WalletTransactionType["REFUND"] = "refund";
    WalletTransactionType["WITHDRAWAL_PENDING"] = "withdrawal_pending";
    WalletTransactionType["WITHDRAWAL_COMPLETED"] = "withdrawal_completed";
    WalletTransactionType["WITHDRAWAL_REJECTED"] = "withdrawal_rejected";
    WalletTransactionType["ADJUSTMENT"] = "adjustment";
})(WalletTransactionType || (exports.WalletTransactionType = WalletTransactionType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["NEW_REFERRAL"] = "new_referral";
    NotificationType["NEW_SALE"] = "new_sale";
    NotificationType["WITHDRAWAL_APPROVED"] = "withdrawal_approved";
    NotificationType["WITHDRAWAL_REJECTED"] = "withdrawal_rejected";
    NotificationType["WITHDRAWAL_REQUESTED"] = "withdrawal_requested";
    NotificationType["COURSE_PURCHASED"] = "course_purchased";
    NotificationType["COUPON_USED"] = "coupon_used";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=app.constants.js.map