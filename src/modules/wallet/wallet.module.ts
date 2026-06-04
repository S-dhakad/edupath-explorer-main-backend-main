import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { WalletTransaction, WalletTransactionSchema } from './schemas/wallet-transaction.schema';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
  ],
  providers: [WalletRepository, WalletService],
  controllers: [WalletController],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}
