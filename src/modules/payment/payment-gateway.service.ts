import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PaymentStatus } from '../../common/constants/app.constants';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private config: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

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
    const key = this.config.get<string>('razorpay.keyId');
    const doc = await this.paymentModel.create({
      payerUserId: new Types.ObjectId(payerUserId),
      courseId: opts.courseId ? new Types.ObjectId(opts.courseId) : null,
      planId: opts.planId ? new Types.ObjectId(opts.planId) : null,
      couponCode: opts.couponCode,
      amount,
      currency: 'INR',
      provider: 'razorpay',
      status: key ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
      externalId: key ? `order_${Date.now()}` : `mock_rzp_${Date.now()}`,
    });
    return {
      payment: doc,
      keyId: key || null,
      orderId: doc.externalId,
      message: key ? 'Use Razorpay checkout with this order id' : 'Razorpay keys missing — mock completed',
    };
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
