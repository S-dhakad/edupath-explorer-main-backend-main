import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.create(user._id.toString(), body);
  }

  @Get('course/:courseId')
  list(@Param('courseId') courseId: string) {
    return this.svc.listByCourse(courseId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.svc.listAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      courseId,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
