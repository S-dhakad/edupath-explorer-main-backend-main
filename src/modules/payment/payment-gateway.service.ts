import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PaymentStatus } from '../../common/constants/app.constants';

export type RazorpayVerifyDto = {
  paymentId: string;
  orderId: string;
  razorpayPaymentId: string;
  signature: string;
};

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private razorpayClient: Razorpay | null = null;

  constructor(
    private config: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  private isRazorpayConfigured(): boolean {
    return Boolean(
      this.config.get<string>('razorpay.keyId') &&
        this.config.get<string>('razorpay.keySecret'),
    );
  }

  private getRazorpayClient(): Razorpay {
    if (this.razorpayClient) return this.razorpayClient;
    const keyId = this.config.get<string>('razorpay.keyId');
    const keySecret = this.config.get<string>('razorpay.keySecret');
    if (!keyId || !keySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }
    this.razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this.razorpayClient;
  }

  async createStripeLikeOrder(
    payerUserId: string,
    amount: number,
    opts: { courseId?: string; planId?: string; couponCode?: string },
  ) {
    const secret = this.config.get<string>('stripe.secretKey');
    const doc = await this.paymentModel.create({
      payerUserId: new Types.ObjectId(payerUserId),
      courseId: opts.courseId ? new Types.ObjectId(opts.courseId) : null,
      planId: opts.planId ? new Types.ObjectId(opts.planId) : null,
      couponCode: opts.couponCode,
      amount,
      currency: 'INR',
      provider: 'stripe',
      status: secret ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
      externalId: secret ? `pi_${Date.now()}` : `mock_${Date.now()}`,
    });
    return {
      payment: doc,
      clientSecret: secret ? null : 'mock-no-stripe-key-configured',
      message: secret
        ? 'Configure Stripe SDK in production to return real clientSecret'
        : 'Stripe key missing — payment marked completed for local development only',
    };
  }

  async createRazorpayLikeOrder(
    payerUserId: string,
    amount: number,
    opts: { courseId?: string; planId?: string; couponCode?: string },
  ) {
    const keyId = this.config.get<string>('razorpay.keyId');
    const doc = await this.paymentModel.create({
      payerUserId: new Types.ObjectId(payerUserId),
      courseId: opts.courseId ? new Types.ObjectId(opts.courseId) : null,
      planId: opts.planId ? new Types.ObjectId(opts.planId) : null,
      couponCode: opts.couponCode,
      amount,
      currency: 'INR',
      provider: 'razorpay',
      status: keyId ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
      externalId: keyId ? '' : `mock_rzp_${Date.now()}`,
    });

    if (!this.isRazorpayConfigured()) {
      const paymentMock = this.config.get<boolean>('razorpay.paymentMock') === true;
      if (!paymentMock) {
        throw new BadRequestException(
          'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env, then restart the server.',
        );
      }
      return {
        payment: doc,
        keyId: null,
        orderId: doc.externalId,
        amount: Math.round(amount * 100),
        message: 'Razorpay keys missing — mock completed (RAZORPAY_PAYMENT_MOCK=true)',
      };
    }

    try {
      const rzp = this.getRazorpayClient();
      const order = await rzp.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: doc._id.toString(),
        notes: {
          paymentId: doc._id.toString(),
          payerUserId,
          planId: opts.planId ?? '',
          courseId: opts.courseId ?? '',
        },
      });

      doc.externalId = order.id;
      await doc.save();

      return {
        payment: doc,
        keyId,
        orderId: order.id,
        amount: order.amount,
        message: 'Use Razorpay checkout with this order id',
      };
    } catch (err: any) {
      await this.paymentModel.findByIdAndDelete(doc._id).exec();
      const msg = err?.error?.description || err?.message || 'Failed to create Razorpay order';
      this.logger.error(`Razorpay order create failed: ${msg}`);
      throw new BadRequestException(msg);
    }
  }

  verifyPaymentSignature(orderId: string, razorpayPaymentId: string, signature: string): boolean {
    const secret = this.config.get<string>('razorpay.keySecret');
    if (!secret) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${razorpayPaymentId}`)
      .digest('hex');
    return expected === signature;
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

  async confirmRazorpayPayment(dto: RazorpayVerifyDto) {
    const pay = await this.paymentModel.findById(dto.paymentId).exec();
    if (!pay) throw new BadRequestException('Payment not found');
    if (pay.provider !== 'razorpay') {
      throw new BadRequestException('Not a Razorpay payment');
    }
    if (pay.status === PaymentStatus.COMPLETED) {
      return pay;
    }

    if (!this.isRazorpayConfigured()) {
      if (this.config.get<boolean>('razorpay.paymentMock') !== true) {
        throw new BadRequestException(
          'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env.',
        );
      }
      pay.status = PaymentStatus.COMPLETED;
      await pay.save();
      return pay;
    }

    if (pay.externalId !== dto.orderId) {
      throw new BadRequestException('Order id does not match this payment');
    }

    if (!this.verifyPaymentSignature(dto.orderId, dto.razorpayPaymentId, dto.signature)) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    pay.status = PaymentStatus.COMPLETED;
    pay.providerPayload = {
      ...(pay.providerPayload ?? {}),
      razorpayOrderId: dto.orderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      verifiedAt: new Date().toISOString(),
    };
    await pay.save();
    return pay;
  }

  async confirmGuestRazorpayPayment(dto: RazorpayVerifyDto) {
    const pay = await this.paymentModel.findById(dto.paymentId).lean();
    const kind = (pay?.providerPayload as Record<string, unknown> | undefined)?.checkoutKind;
    if (!pay || kind !== 'guest') {
      throw new BadRequestException('Invalid guest payment session');
    }
    return this.confirmRazorpayPayment(dto);
  }

  async markCompletedByExternal(provider: 'stripe' | 'razorpay', externalId: string) {
    return this.paymentModel
      .findOneAndUpdate(
        { provider, externalId, status: PaymentStatus.PENDING },
        { status: PaymentStatus.COMPLETED },
        { new: true },
      )
      .exec();
  }

  logWebhook(provider: string, body: unknown) {
    this.logger.log(`Webhook ${provider}: ${JSON.stringify(body).slice(0, 500)}`);
  }
}
