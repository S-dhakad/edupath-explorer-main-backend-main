import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    send(to: string, subject: string, html: string, text?: string): Promise<void>;
    withdrawalRequested(email: string, name: string, amount: number): Promise<void>;
    withdrawalPaid(email: string, name: string, amount: number, adminNote?: string): Promise<void>;
    withdrawalRejected(email: string, name: string, amount: number, adminNote?: string): Promise<void>;
    planSalePending(email: string, name: string, planName: string): Promise<void>;
    planSaleActivated(email: string, name: string, planName: string, tempPassword: string, promoCode?: string): Promise<void>;
}
