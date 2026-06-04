import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async publicCommissionPreview() {
    const s = await this.settingsService.getGlobal();
    return {
      couponOwnerPercent: s.couponOwnerPercent,
      platformPercent: s.platformPercent,
      directParentPercent: s.directParentPercent,
      memberPromoBuyerDiscountPercent: s.memberPromoBuyerDiscountPercent,
    };
  }

  @Patch('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async adminUpdate(@Body() body: Record<string, number | boolean>) {
    return this.settingsService.updateGlobal(body);
  }
}
