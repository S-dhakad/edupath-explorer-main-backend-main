import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async create(@Body() plan: Partial<any>) {
    return this.plansService.create(plan);
  }

  @Get()
  async findAll(@Query('active') active?: string) {
    if (active === 'true' || active === '1') {
      return this.plansService.findActive();
    }
    return this.plansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.plansService.findById(id);
  }
}