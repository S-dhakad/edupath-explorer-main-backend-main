import { Module } from '@nestjs/common';
import { RazorpayPayoutService } from './razorpay-payout.service';

@Module({
  providers: [RazorpayPayoutService],
  exports: [RazorpayPayoutService],
})
export class PayoutModule {}
