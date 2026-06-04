import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.coursesService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() course: Partial<any>, @Request() req) {
    course.uploadedBy = req.user._id;
    return this.coursesService.create(course);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async adminUpdate(@Param('id') id: string, @Body() body: Partial<any>) {
    return this.coursesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async adminRemove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
