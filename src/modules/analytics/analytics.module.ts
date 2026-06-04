import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from '../commission/schemas/commission.schema';
import { Purchase, PurchaseSchema } from '../purchases/purchase.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
