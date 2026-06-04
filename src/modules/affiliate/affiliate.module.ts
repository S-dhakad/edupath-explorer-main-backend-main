import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commission, CommissionSchema } from '../commission/schemas/commission.schema';
import { User, UserSchema } from '../users/user.schema';
import { UsersModule } from '../users/users.module';
import { AffiliateController } from './affiliate.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [AffiliateController],
})
export class AffiliateModule {}
