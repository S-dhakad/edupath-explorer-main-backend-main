import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanSalesController } from './plan-sales.controller';
import { PlanSalesService } from './plan-sales.service';
import { PlanSale, PlanSaleSchema } from './plan-sale.schema';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/user.schema';
import { Plan, PlanSchema } from '../plans/plan.schema';
import { PlansModule } from '../plans/plans.module';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schema';
import { PaymentModule } from '../payment/payment.module';
import { CommissionModule } from '../commission/commission.module';
import { PromoCoupon, PromoCouponSchema } from '../coupons/promo-coupon.schema';
import { PromoCouponsService } from '../coupons/promo-coupons.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PlansModule,
    SettingsModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => CommissionModule),
    MongooseModule.forFeature([
      { name: PlanSale.name, schema: PlanSaleSchema },
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: PromoCoupon.name, schema: PromoCouponSchema },
    ]),
  ],
  controllers: [PlanSalesController],
  providers: [PlanSalesService, PromoCouponsService],
  exports: [PlanSalesService],
})
export class PlanSalesModule {}
