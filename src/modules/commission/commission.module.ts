import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from './schemas/commission.schema';
import { Purchase, PurchaseSchema } from '../purchases/purchase.schema';
import { PlanSale, PlanSaleSchema } from '../plan-sales/plan-sale.schema';
import { User, UserSchema } from '../users/user.schema';
import { RevenueDistributionService } from './revenue-distribution.service';
import { WalletModule } from '../wallet/wallet.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: PlanSale.name, schema: PlanSaleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WalletModule,
    SettingsModule,
  ],
  providers: [RevenueDistributionService],
  exports: [RevenueDistributionService],
})
export class CommissionModule {}
