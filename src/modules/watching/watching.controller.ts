import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WatchingService } from './watching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('watching')
@Controller('watching')
export class WatchingController {
  constructor(private readonly watchingService: WatchingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async record(
    @Body()
    body: {
      courseId: string;
      videoIndex: number;
      lessonKey?: string;
      lastPositionSec?: number;
      progressPercent?: number;
      completed?: boolean;
    },
    @Request() req,
  ) {
    return this.watchingService.recordWatch(req.user._id.toString(), body.courseId, body.videoIndex, {
      lessonKey: body.lessonKey,
      lastPositionSec: body.lastPositionSec,
      progressPercent: body.progressPercent,
      completed: body.completed,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHistory(@Request() req) {
    return this.watchingService.getHistory(req.user._id.toString());
  }
}
