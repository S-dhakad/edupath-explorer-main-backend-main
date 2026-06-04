"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MailService = MailService_1 = class MailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async send(to, subject, html, text) {
        const webhook = this.config.get('mail.webhookUrl');
        const from = this.config.get('mail.from') || 'noreply@startsuccess.local';
        const body = { from, to, subject, html, text: text || html.replace(/<[^>]+>/g, '') };
        if (webhook) {
            try {
                await fetch(webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                return;
            }
            catch (e) {
                this.logger.error(`Mail webhook failed: ${e}`);
            }
        }
        this.logger.warn(`[mail] To: ${to} | ${subject}`);
        this.logger.debug(body.text);
    }
    withdrawalRequested(email, name, amount) {
        return this.send(email, 'Withdrawal request received — StartSuccess', `<p>Hi ${name},</p>
       <p>We received your withdrawal request for <strong>₹${amount.toLocaleString('en-IN')}</strong>.</p>
       <p>Our team will review it shortly. You will receive another email once the payment is processed.</p>
       <p>— StartSuccess Team</p>`);
    }
    withdrawalPaid(email, name, amount, adminNote) {
        return this.send(email, 'Withdrawal paid — StartSuccess', `<p>Hi ${name},</p>
       <p>Your withdrawal of <strong>₹${amount.toLocaleString('en-IN')}</strong> has been <strong>approved and paid</strong>.</p>
       ${adminNote ? `<p>Note: ${adminNote}</p>` : ''}
       <p>— StartSuccess Team</p>`);
    }
    withdrawalRejected(email, name, amount, adminNote) {
        return this.send(email, 'Withdrawal update — StartSuccess', `<p>Hi ${name},</p>
       <p>Your withdrawal request for <strong>₹${amount.toLocaleString('en-IN')}</strong> could not be approved.</p>
       ${adminNote ? `<p>Reason: ${adminNote}</p>` : ''}
       <p>The amount has been returned to your available wallet balance.</p>
       <p>— StartSuccess Team</p>`);
    }
    planSalePending(email, name, planName) {
        return this.send(email, 'Plan registration received — StartSuccess', `<p>Hi ${name},</p>
       <p>Your registration for <strong>${planName}</strong> is recorded.</p>
       <p>Your account will be activated after payment is confirmed. We will email you when you can sign in.</p>
       <p>— StartSuccess Team</p>`);
    }
    planSaleActivated(email, name, planName, tempPassword, promoCode) {
        const loginUrl = this.config.get('frontendUrl') || 'http://localhost:5173';
        const pwdBlock = tempPassword
            ? `<p>Email: <strong>${email}</strong><br/>Temporary password: <strong>${tempPassword}</strong></p>
         <p>Please change your password after first login.</p>`
            : `<p>Sign in with your existing password at <a href="${loginUrl}/login">${loginUrl}/login</a></p>`;
        const promoBlock = promoCode
            ? `<p>Your personal promo / referral code: <strong style="font-size:1.1em">${promoCode}</strong></p>
         <p>Share this code so others can register or checkout under your referral.</p>`
            : '';
        return this.send(email, 'Your StartSuccess account is active', `<p>Hi ${name},</p>
       <p>Payment for <strong>${planName}</strong> is confirmed. Your account is now <strong>active</strong>.</p>
       ${promoBlock}
       <p>Sign in at <a href="${loginUrl}/login">${loginUrl}/login</a></p>
       ${pwdBlock}
       <p>— StartSuccess Team</p>`);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map