import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import { PurchasesModule } from '../purchases/purchases.module';
import { WalletModule } from '../wallet/wallet.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CoursesModule } from '../courses/courses.module';
import { PlansModule } from '../plans/plans.module';
import { KycModule } from '../kyc/kyc.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => PurchasesModule),
    CoursesModule,
    PlansModule,
    WalletModule,
    AnalyticsModule,
    KycModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}