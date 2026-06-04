import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { Commission, CommissionDocument } from '../commission/schemas/commission.schema';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Commission.name) private readonly commissionModel: Model<CommissionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @Get('tree')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async tree(@CurrentUser() user: any, @Query('depth') depth?: string) {
    const d = Math.min(parseInt(depth || '3', 10) || 3, 6);
    return this.usersService.listReferralTree((user as any)._id.toString(), d);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async stats(@CurrentUser() user: any) {
    const uid = new Types.ObjectId((user as any)._id);
    const [direct, commissionSum] = await Promise.all([
      this.userModel.countDocuments({ referredBy: uid }),
      this.commissionModel.aggregate([
        { $match: { beneficiaryUserId: uid } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    const referrals = await this.usersService.getReferrals((user as any)._id.toString());
    return {
      directReferrals: direct,
      referralListSample: referrals.slice(0, 50),
      totalCommissionRecorded: commissionSum[0]?.total || 0,
    };
  }
}
