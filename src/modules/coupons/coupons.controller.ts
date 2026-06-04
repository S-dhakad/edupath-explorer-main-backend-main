import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchasesService } from '../purchases/purchases.service';
import { ConfigService } from '@nestjs/config';
import { PromoCouponsService } from './promo-coupons.service';
import { UsersService } from '../users/users.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(
    private purchases: PurchasesService,
    private config: ConfigService,
    private promoCoupons: PromoCouponsService,
    private usersService: UsersService,
  ) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  validate(@CurrentUser() user: any, @Body() body: { code: string }) {
    return this.usersService.validateReferralCodeForCheckout(body.code, user._id.toString());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@CurrentUser() user: any) {
    const base = this.config.get<string>('frontendUrl') || 'http://localhost:5173';
    const unlocked = Boolean(user.accountActive && user.planId);
    if (!unlocked) {
      return {
        code: null,
        unlocked: false,
        referralLink: null,
        qrData: null,
        message: 'Your promo code will be available after your plan is active.',
      };
    }
    const code = user.referralCode || (await this.usersService.ensureReferralCode(user._id.toString()));
    return {
      code,
      unlocked: true,
      referralLink: `${base}/signup?ref=${code}`,
      qrData: `${base}/signup?ref=${code}`,
    };
  }

  @Get('me/performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  performance(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.purchases.listAffiliateSales(user.referralCode, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminList() {
    return this.promoCoupons.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminCreate(@Body() body: any) {
    return this.promoCoupons.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminUpdate(@Param('id') id: string, @Body() body: any) {
    return this.promoCoupons.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminDelete(@Param('id') id: string) {
    return this.promoCoupons.remove(id);
  }
}
