import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.config.get<string>('mail.smtpHost');
    const port = this.config.get<number>('mail.smtpPort') || 587;
    const user = this.config.get<string>('mail.smtpUser');
    const pass = this.config.get<string>('mail.smtpPass');
    const secure = this.config.get<boolean>('mail.smtpSecure') || port === 465;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mail Transporter initialized with host: ${host}:${port}`);
    }
  }

  async send(to: string, subject: string, html: string, text?: string): Promise<void> {
    const from = this.config.get<string>('mail.from') || 'StartSuccess <noreply@startsuccess.in>';
    const plainText = text || html.replace(/<[^>]+>/g, '');

    // 1. Try sending via SMTP if transporter configured
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: plainText,
        });
        this.logger.log(`[SMTP Mail Sent] To: ${to} | Subject: ${subject}`);
        return;
      } catch (err) {
        this.logger.error(`SMTP sending failed to ${to}: ${err.message || err}`);
      }
    }

    // 2. Webhook fallback
    const webhook = this.config.get<string>('mail.webhookUrl');
    const body = { from, to, subject, html, text: plainText };

    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        this.logger.log(`[Webhook Mail Sent] To: ${to} | Subject: ${subject}`);
        return;
      } catch (e) {
        this.logger.error(`Mail webhook failed: ${e}`);
      }
    }

    // 3. Fallback to console logger
    this.logger.warn(`[Local Mail] To: ${to} | Subject: ${subject}`);
    this.logger.debug(plainText);
  }

  async sendVerificationOtp(email: string, name: string, otp: string, token: string) {
    const frontendUrl = (this.config.get<string>('frontendUrl') || 'http://localhost:5173').replace(/\/$/, '');
    const directVerifyUrl = `${frontendUrl}/profile?verify_token=${encodeURIComponent(token)}`;

    this.logger.log(`====================================================`);
    this.logger.log(`[EMAIL VERIFICATION OTP] User: ${email} | Code: ${otp}`);
    this.logger.log(`[DIRECT VERIFY LINK] ${directVerifyUrl}`);
    this.logger.log(`====================================================`);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #047857; margin: 4px 0; }
        .otp-hint { font-size: 13px; color: #059669; margin-top: 4px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px; }
        .footer { border-top: 1px solid #e5e7eb; padding: 20px 24px; font-size: 12px; color: #6b7280; text-align: center; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>StartSuccess</h1>
          <p>Email Address Verification</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name || 'there'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            Please use the 6-digit OTP code below to verify your email address on your StartSuccess account:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-hint">Expires in 15 minutes</div>
          </div>
          <div class="btn-wrapper">
            <a href="${directVerifyUrl}" class="btn" target="_blank">Verify Email Directly</a>
          </div>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            Or copy and paste this link in your browser:<br/>
            <a href="${directVerifyUrl}" style="color: #059669; word-break: break-all;">${directVerifyUrl}</a>
          </p>
          <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} StartSuccess. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    return this.send(
      email,
      `Your verification code is ${otp} — StartSuccess`,
      html,
      `Hi ${name || 'there'},\n\nYour StartSuccess verification code is: ${otp}\nValid for 15 minutes.\n\nOr click here to verify:\n${directVerifyUrl}\n\n— StartSuccess Team`,
    );
  }

  async sendPasswordResetOtp(email: string, name: string, otp: string) {
    this.logger.log(`====================================================`);
    this.logger.log(`[PASSWORD RESET OTP] User: ${email} | Code: ${otp}`);
    this.logger.log(`====================================================`);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 32px 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #047857; margin: 4px 0; }
        .otp-hint { font-size: 13px; color: #059669; margin-top: 4px; }
        .footer { border-top: 1px solid #e5e7eb; padding: 20px 24px; font-size: 12px; color: #6b7280; text-align: center; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>StartSuccess</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name || 'there'}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            We received a request to reset your password. Use the 6-digit verification code below to set a new password:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-hint">Valid for 15 minutes</div>
          </div>
          <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            Do not share this code with anyone. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} StartSuccess. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    return this.send(
      email,
      `Your password reset code is ${otp} — StartSuccess`,
      html,
      `Hi ${name || 'there'},\n\nYour StartSuccess password reset code is: ${otp}\nValid for 15 minutes.\n\nIf you did not request this, please ignore this email.\n\n— StartSuccess Team`,
    );
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
