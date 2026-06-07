import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ContactPageService } from './contact-page.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { ContactPage } from './contact-page.schema';

@ApiTags('contact-page')
@Controller()
export class ContactPageController {
  constructor(private svc: ContactPageService) {}

  @Get('public/contact-page')
  @SkipThrottle()
  publicGet() {
    return this.svc.getPublic();
  }

  @Get('admin/contact-page')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminGet() {
    return this.svc.getAdmin();
  }

  @Patch('admin/contact-page')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminPatch(@Body() body: Partial<ContactPage>) {
    return this.svc.update(body);
  }
}
