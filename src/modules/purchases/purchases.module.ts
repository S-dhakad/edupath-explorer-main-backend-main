import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { Purchase, PurchaseSchema } from './purchase.schema';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { CommissionModule } from '../commission/commission.module';
import { SettingsModule } from '../settings/settings.module';
import { PaymentModule } from '../payment/payment.module';
import { PlansModule } from '../plans/plans.module';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    forwardRef(() => UsersModule),
    CoursesModule,
    CommissionModule,
    SettingsModule,
    forwardRef(() => PaymentModule),
    PlansModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}