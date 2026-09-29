import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { WatchingModule } from './modules/watching/watching.module';
import { PlansModule } from './modules/plans/plans.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CommissionModule } from './modules/commission/commission.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BannersModule } from './modules/banners/banners.module';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { PublicModule } from './modules/public/public.module';
import { KycModule } from './modules/kyc/kyc.module';
import { MailModule } from './modules/mail/mail.module';
import { PlanSalesModule } from './modules/plan-sales/plan-sales.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 200,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    PurchasesModule,
    WatchingModule,
    PlansModule,
    WalletModule,
    SettingsModule,
    CommissionModule,
    AffiliateModule,
    CategoriesModule,
    WithdrawalsModule,
    NotificationsModule,
    PaymentModule,
    AnalyticsModule,
    AdminModule,
    CouponsModule,
    ReviewsModule,
    BannersModule,
    TeamMembersModule,
    PublicModule,
    KycModule,
    PlanSalesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
