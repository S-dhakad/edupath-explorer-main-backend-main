import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private svc: BannersService) {}

  @Get()
  publicList() {
    return this.svc.active();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  all() {
    return this.svc.all();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() body: Partial<any>) {
    return this.svc.create(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Partial<any>) {
    return this.svc.update(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
