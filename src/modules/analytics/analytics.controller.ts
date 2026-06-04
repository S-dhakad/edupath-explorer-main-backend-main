import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from '../commission/schemas/commission.schema';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
  ) {}

  @Get('me/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  summary(@CurrentUser() user: any) {
    return this.analytics.dashboardSummary(user._id.toString());
  }

  @Get('me/earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  earnings(
    @CurrentUser() user: any,
    @Query('granularity') g?: 'day' | 'week' | 'month',
    @Query('days') days?: string,
  ) {
    return this.analytics.earningsSeries(user._id.toString(), g || 'day', parseInt(days || '30', 10));
  }

  @Get('admin/platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async platformRevenue() {
    const agg = await this.commissionModel.aggregate([
      { $match: { incomeCategory: 'platform' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return { platformRevenueTotal: agg[0]?.total || 0 };
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  leaderboard(@Query('period') period?: 'daily' | 'weekly' | 'monthly' | 'overall') {
    const p = period || 'monthly';
    if (!['daily', 'weekly', 'monthly', 'overall'].includes(p)) {
      return this.analytics.leaderboard('monthly');
    }
    return this.analytics.leaderboard(p);
  }

  @Get('income/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  incomeUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.analytics.incomeUsersList({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
      search,
    });
  }
}
