export declare const ADMIN_MANUAL_PAYOUT_METHODS: readonly ["cash", "upi", "bank_transfer", "card", "other"];
export type AdminManualPayoutMethod = (typeof ADMIN_MANUAL_PAYOUT_METHODS)[number];
export declare class AdminDecideWithdrawalDto {
    approve: boolean;
    adminNote?: string;
    payoutMode?: 'manual' | 'razorpayx';
    paymentMethod?: AdminManualPayoutMethod;
    paymentReference?: string;
}
