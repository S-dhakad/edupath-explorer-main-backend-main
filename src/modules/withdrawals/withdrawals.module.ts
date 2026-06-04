import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Withdrawal, WithdrawalSchema } from './withdrawal.schema';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { WalletModule } from '../wallet/wallet.module';
import { User, UserSchema } from '../users/user.schema';
import { KycModule } from '../kyc/kyc.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PayoutModule } from '../payout/payout.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WalletModule,
    KycModule,
    NotificationsModule,
    PayoutModule,
  ],
  providers: [WithdrawalsService],
  controllers: [WithdrawalsController],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
