"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayPayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayPayoutService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let RazorpayPayoutService = RazorpayPayoutService_1 = class RazorpayPayoutService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RazorpayPayoutService_1.name);
        this.baseUrl = 'https://api.razorpay.com/v1';
    }
    isConfigured() {
        return Boolean(this.config.get('razorpay.keyId') &&
            this.config.get('razorpay.keySecret') &&
            this.config.get('razorpay.xAccountNumber'));
    }
    useMock() {
        return this.config.get('razorpay.payoutMock') !== false && !this.isConfigured();
    }
    verifyWebhookSignature(body, signature) {
        const secret = this.config.get('razorpay.webhookSecret');
        if (!secret)
            return true;
        try {
            const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
            return expected === signature;
        }
        catch {
            return false;
        }
    }
    async sendBankPayout(referenceId, amountInr, bank, existing) {
        if (this.useMock()) {
            return this.mockPayout(referenceId, amountInr);
        }
        if (!this.isConfigured()) {
            throw new common_1.BadRequestException('RazorpayX payout is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_X_ACCOUNT_NUMBER or enable RAZORPAY_PAYOUT_MOCK=true for development.');
        }
        let contactId = existing?.contactId;
        let fundAccountId = existing?.fundAccountId;
        if (!contactId) {
            const contact = await this.request('POST', '/contacts', {
                name: bank.accountHolderName,
                email: bank.email || `${referenceId}@payout.startsuccess.local`,
                contact: bank.phone || '9999999999',
                type: 'customer',
                reference_id: referenceId,
            });
            contactId = contact.id;
        }
        if (!fundAccountId) {
            const fa = await this.request('POST', '/fund_accounts', {
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
        const mode = this.config.get('razorpay.payoutMode') || 'IMPS';
        const accountNumber = this.config.get('razorpay.xAccountNumber');
        const amountPaise = Math.round(amountInr * 100);
        const payout = await this.request('POST', '/payouts', {
            account_number: accountNumber,
            fund_account_id: fundAccountId,
            amount: amountPaise,
            currency: 'INR',
            mode,
            purpose: 'payout',
            queue_if_low_balance: true,
            reference_id: referenceId,
            narration: 'StartSuccess withdrawal',
        }, `payout_${referenceId}`);
        return {
            contactId,
            fundAccountId,
            payoutId: payout.id,
            status: payout.status,
            mock: false,
        };
    }
    async fetchPayout(payoutId) {
        if (payoutId.startsWith('pout_mock_')) {
            return { id: payoutId, status: 'processed' };
        }
        return this.request('GET', `/payouts/${payoutId}`);
    }
    mockPayout(referenceId, amountInr) {
        this.logger.warn(`Mock RazorpayX payout ₹${amountInr} for ${referenceId}`);
        return {
            contactId: `cont_mock_${referenceId}`,
            fundAccountId: `fa_mock_${referenceId}`,
            payoutId: `pout_mock_${referenceId}_${Date.now()}`,
            status: 'processing',
            mock: true,
        };
    }
    authHeader() {
        const id = this.config.get('razorpay.keyId');
        const secret = this.config.get('razorpay.keySecret');
        return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
    }
    async request(method, path, body, idempotencyKey) {
        const headers = {
            Authorization: this.authHeader(),
            'Content-Type': 'application/json',
        };
        if (idempotencyKey)
            headers['X-Payout-Idempotency'] = idempotencyKey;
        const res = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = (await res.json().catch(() => ({})));
        if (!res.ok) {
            const err = data.error;
            const msg = err?.description || err?.reason || `Razorpay API error (${res.status})`;
            this.logger.error(`Razorpay ${method} ${path}: ${msg}`, JSON.stringify(data));
            throw new common_1.BadRequestException(msg);
        }
        return data;
    }
};
exports.RazorpayPayoutService = RazorpayPayoutService;
exports.RazorpayPayoutService = RazorpayPayoutService = RazorpayPayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayPayoutService);
//# sourceMappingURL=razorpay-payout.service.js.map