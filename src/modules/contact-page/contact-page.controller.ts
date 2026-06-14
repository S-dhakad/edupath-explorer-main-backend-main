import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ContactPageService } from './contact-page.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { ContactPage } from './contact-page.schema';
import { SubmitContactInquiryDto } from './dto/submit-contact-inquiry.dto';

@ApiTags('contact-page')
@Controller()
export class ContactPageController {
  constructor(private svc: ContactPageService) {}

  @Get('public/contact-page')
  @SkipThrottle()
  publicGet() {
    return this.svc.getPublic();
  }

  @Post('public/contact-inquiry')
  submitInquiry(@Body() body: SubmitContactInquiryDto) {
    return this.svc.submitInquiry(body);
  }

  @Get('admin/contact-inquiries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminListInquiries(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listInquiries({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Delete('admin/contact-inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminDeleteInquiry(@Param('id') id: string) {
    return this.svc.deleteInquiry(id);
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
