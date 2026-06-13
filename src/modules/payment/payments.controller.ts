import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Headers,
  RawBodyRequest,
  UseGuards,
  Request,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentGatewayService } from './payment-gateway.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanSalesService } from '../plan-sales/plan-sales.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentGatewayService,
    @Inject(forwardRef(() => PlanSalesService))
    private readonly planSales: PlanSalesService,
  ) {}

  @Post('stripe/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  stripeOrder(
    @Request() req: any,
    @Body() body: { courseId?: string; planId?: string; amount: number; couponCode?: string },
  ) {
    return this.payments.createStripeLikeOrder(req.user._id.toString(), body.amount, {
      courseId: body.courseId,
      planId: body.planId,
      couponCode: body.couponCode,
    });
  }

  @Post('razorpay/order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  rzpOrder(
    @Request() req: any,
    @Body() body: { courseId?: string; planId?: string; amount: number; couponCode?: string },
  ) {
    return this.payments.createRazorpayLikeOrder(req.user._id.toString(), body.amount, {
      courseId: body.courseId,
      planId: body.planId,
      couponCode: body.couponCode,
    });
  }

  @Post('razorpay/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async rzpVerify(
    @Body()
    body: {
      paymentId: string;
      orderId: string;
      razorpayPaymentId: string;
      signature: string;
    },
  ) {
    const pay = await this.payments.confirmRazorpayPayment(body);
    return {
      payment: {
        _id: pay._id,
        status: pay.status,
        orderId: pay.externalId,
      },
      verified: true,
    };
  }

  @Post('public/razorpay/verify')
  async publicRzpVerify(
    @Body()
    body: {
      paymentId: string;
      orderId: string;
      razorpayPaymentId: string;
      signature: string;
    },
  ) {
    const confirmed = await this.payments.confirmGuestRazorpayPayment(body);
    return {
      payment: {
        _id: confirmed._id,
        status: confirmed.status,
        orderId: confirmed.externalId,
      },
      verified: true,
    };
  }

  @Post('webhook/stripe')
  stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    this.payments.logWebhook('stripe', { sig, body: req.body });
    return { received: true };
  }

  @Post('webhook/razorpay')
  async rzpWebhook(
    @Req() req: RawBodyRequest<Request> & { rawBody?: Buffer },
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    const raw =
      req.rawBody?.toString('utf8') ||
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));

    if (signature && !this.payments.verifyWebhookSignature(raw, signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }

    this.payments.logWebhook('razorpay', body);
    const orderId =
      body?.payload?.payment?.entity?.order_id ||
      body?.payload?.order?.entity?.id ||
      body?.order_id;
    if (orderId) {
      const pay = await this.payments.markCompletedByExternal('razorpay', orderId);
      if (pay?.planId) {
        try {
          await this.planSales.completeSaleByPaymentId(pay._id.toString());
        } catch {
          /* idempotent or already finalized */
        }
      }
    }
    return { received: true };
  }
}
