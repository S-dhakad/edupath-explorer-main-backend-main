import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(to: string, subject: string, html: string, text?: string): Promise<void> {
    const webhook = this.config.get<string>('mail.webhookUrl');
    const from = this.config.get<string>('mail.from') || 'noreply@startsuccess.local';
    const body = { from, to, subject, html, text: text || html.replace(/<[^>]+>/g, '') };

    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return;
      } catch (e) {
        this.logger.error(`Mail webhook failed: ${e}`);
      }
    }

    this.logger.warn(`[mail] To: ${to} | ${subject}`);
    this.logger.debug(body.text);
  }

  withdrawalRequested(email: string, name: string, amount: number) {
    return this.send(
      email,
      'Withdrawal request received — StartSuccess',
      `<p>Hi ${name},</p>
       <p>We received your withdrawal request for <strong>₹${amount.toLocaleString('en-IN')}</strong>.</p>
       <p>Our team will review it shortly. You will receive another email once the payment is processed.</p>
       <p>— StartSuccess Team</p>`,
    );
  }

  withdrawalPaid(email: string, name: string, amount: number, adminNote?: string) {
    return this.send(
      email,
      'Withdrawal paid — StartSuccess',
      `<p>Hi ${name},</p>
       <p>Your withdrawal of <strong>₹${amount.toLocaleString('en-IN')}</strong> has been <strong>approved and paid</strong>.</p>
       ${adminNote ? `<p>Note: ${adminNote}</p>` : ''}
       <p>— StartSuccess Team</p>`,
    );
  }

  withdrawalRejected(email: string, name: string, amount: number, adminNote?: string) {
    return this.send(
      email,
      'Withdrawal update — StartSuccess',
      `<p>Hi ${name},</p>
       <p>Your withdrawal request for <strong>₹${amount.toLocaleString('en-IN')}</strong> could not be approved.</p>
       ${adminNote ? `<p>Reason: ${adminNote}</p>` : ''}
       <p>The amount has been returned to your available wallet balance.</p>
       <p>— StartSuccess Team</p>`,
    );
  }

  planSalePending(email: string, name: string, planName: string) {
    return this.send(
      email,
      'Plan registration received — StartSuccess',
      `<p>Hi ${name},</p>
       <p>Your registration for <strong>${planName}</strong> is recorded.</p>
       <p>Your account will be activated after payment is confirmed. We will email you when you can sign in.</p>
       <p>— StartSuccess Team</p>`,
    );
  }

  planSaleActivated(
    email: string,
    name: string,
    planName: string,
    tempPassword: string,
    promoCode?: string,
  ) {
    const loginUrl = this.config.get<string>('frontendUrl') || 'http://localhost:5173';
    const pwdBlock = tempPassword
      ? `<p>Email: <strong>${email}</strong><br/>Temporary password: <strong>${tempPassword}</strong></p>
         <p>Please change your password after first login.</p>`
      : `<p>Sign in with your existing password at <a href="${loginUrl}/login">${loginUrl}/login</a></p>`;
    const promoBlock = promoCode
      ? `<p>Your personal promo / referral code: <strong style="font-size:1.1em">${promoCode}</strong></p>
         <p>Share this code so others can register or checkout under your referral.</p>`
      : '';
    return this.send(
      email,
      'Your StartSuccess account is active',
      `<p>Hi ${name},</p>
       <p>Payment for <strong>${planName}</strong> is confirmed. Your account is now <strong>active</strong>.</p>
       ${promoBlock}
       <p>Sign in at <a href="${loginUrl}/login">${loginUrl}/login</a></p>
       ${pwdBlock}
       <p>— StartSuccess Team</p>`,
    );
  }
}
