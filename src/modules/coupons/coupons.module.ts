import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponsController } from './coupons.controller';
import { PurchasesModule } from '../purchases/purchases.module';
import { UsersModule } from '../users/users.module';
import { PromoCoupon, PromoCouponSchema } from './promo-coupon.schema';
import { PromoCouponsService } from './promo-coupons.service';

@Module({
  imports: [
    UsersModule,
    PurchasesModule,
    MongooseModule.forFeature([{ name: PromoCoupon.name, schema: PromoCouponSchema }]),
  ],
  controllers: [CouponsController],
  providers: [PromoCouponsService],
  exports: [PromoCouponsService],
})
export class CouponsModule {}
