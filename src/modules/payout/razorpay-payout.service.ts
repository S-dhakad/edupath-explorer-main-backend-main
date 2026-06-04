import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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

@Injectable()
export class RazorpayPayoutService {
  private readonly logger = new Logger(RazorpayPayoutService.name);
  private readonly baseUrl = 'https://api.razorpay.com/v1';

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('razorpay.keyId') &&
        this.config.get<string>('razorpay.keySecret') &&
        this.config.get<string>('razorpay.xAccountNumber'),
    );
  }

  useMock(): boolean {
    return this.config.get<boolean>('razorpay.payoutMock') !== false && !this.isConfigured();
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const secret = this.config.get<string>('razorpay.webhookSecret');
    if (!secret) return true;
    try {
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      return expected === signature;
    } catch {
      return false;
    }
  }

  /** Create RazorpayX contact + fund account + payout to user's bank. */
  async sendBankPayout(
    referenceId: string,
    amountInr: number,
    bank: BankPayoutDetails,
    existing?: { contactId?: string; fundAccountId?: string },
  ): Promise<RazorpayPayoutResult> {
    if (this.useMock()) {
      return this.mockPayout(referenceId, amountInr);
    }
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'RazorpayX payout is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_X_ACCOUNT_NUMBER or enable RAZORPAY_PAYOUT_MOCK=true for development.',
      );
    }

    let contactId = existing?.contactId;
    let fundAccountId = existing?.fundAccountId;

    if (!contactId) {
      const contact = await this.request<{ id: string }>('POST', '/contacts', {
        name: bank.accountHolderName,
        email: bank.email || `${referenceId}@payout.startsuccess.local`,
        contact: bank.phone || '9999999999',
        type: 'customer',
        reference_id: referenceId,
      });
      contactId = contact.id;
    }

    if (!fundAccountId) {
      const fa = await this.request<{ id: string }>('POST', '/fund_accounts', {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: bank.accountHolderName,
          ifsc: bank.ifscCode.toUpperCase(),
          account_number: String(bank.accountNumber),
        },
      });
      fundAccountId = fa.id;
    }

    const mode = this.config.get<string>('razorpay.payoutMode') || 'IMPS';
    const accountNumber = this.config.get<string>('razorpay.xAccountNumber');
    const amountPaise = Math.round(amountInr * 100);

    const payout = await this.request<{ id: string; status: string }>(
      'POST',
      '/payouts',
      {
        account_number: accountNumber,
        fund_account_id: fundAccountId,
        amount: amountPaise,
        currency: 'INR',
        mode,
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: referenceId,
        narration: 'StartSuccess withdrawal',
      },
      `payout_${referenceId}`,
    );

    return {
      contactId,
      fundAccountId,
      payoutId: payout.id,
      status: payout.status,
      mock: false,
    };
  }

  async fetchPayout(payoutId: string): Promise<{ id: string; status: string; failure_reason?: string }> {
    if (payoutId.startsWith('pout_mock_')) {
      return { id: payoutId, status: 'processed' };
    }
    return this.request('GET', `/payouts/${payoutId}`);
  }

  private mockPayout(referenceId: string, amountInr: number): RazorpayPayoutResult {
    this.logger.warn(`Mock RazorpayX payout ₹${amountInr} for ${referenceId}`);
    return {
      contactId: `cont_mock_${referenceId}`,
      fundAccountId: `fa_mock_${referenceId}`,
      payoutId: `pout_mock_${referenceId}_${Date.now()}`,
      status: 'processing',
      mock: true,
    };
  }

  private authHeader(): string {
    const id = this.config.get<string>('razorpay.keyId');
    const secret = this.config.get<string>('razorpay.keySecret');
    return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    idempotencyKey?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: this.authHeader(),
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) headers['X-Payout-Idempotency'] = idempotencyKey;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = data.error as { description?: string; reason?: string } | undefined;
      const msg = err?.description || err?.reason || `Razorpay API error (${res.status})`;
      this.logger.error(`Razorpay ${method} ${path}: ${msg}`, JSON.stringify(data));
      throw new BadRequestException(msg);
    }
    return data as T;
  }
}
