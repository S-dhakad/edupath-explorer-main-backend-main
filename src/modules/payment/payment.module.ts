import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentsController } from './payments.controller';
import { PlanSalesModule } from '../plan-sales/plan-sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    forwardRef(() => PlanSalesModule),
  ],
  providers: [PaymentGatewayService],
  controllers: [PaymentsController],
  exports: [PaymentGatewayService],
})
export class PaymentModule {}
