import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { Commission, CommissionSchema } from '../commission/schemas/commission.schema';
import { Kyc, KycSchema } from '../kyc/schemas/kyc.schema';
import { Withdrawal, WithdrawalSchema } from '../withdrawals/withdrawal.schema';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    CoursesModule,
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: Kyc.name, schema: KycSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
