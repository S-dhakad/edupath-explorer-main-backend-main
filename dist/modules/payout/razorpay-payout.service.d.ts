import { ConfigService } from '@nestjs/config';
export type BankPayoutDetails = {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    email?: string;
    phone?: string;
};
export type RazorpayPayoutResult = {
    contactId: string;
    fundAccountId: string;
    payoutId: string;
    status: string;
    mock: boolean;
};
export declare class RazorpayPayoutService {
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    useMock(): boolean;
    verifyWebhookSignature(body: string, signature: string): boolean;
    sendBankPayout(referenceId: string, amountInr: number, bank: BankPayoutDetails, existing?: {
        contactId?: string;
        fundAccountId?: string;
    }): Promise<RazorpayPayoutResult>;
    fetchPayout(payoutId: string): Promise<{
        id: string;
        status: string;
        failure_reason?: string;
    }>;
    private mockPayout;
    private authHeader;
    private request;
}
