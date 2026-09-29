import { Body, Controller, Get, Param, Patch, Post, Query, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  list(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.list(user._id.toString(), parseInt(page || '1', 10), parseInt(limit || '30', 10));
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.markRead(user._id.toString(), id);
  }

  /** Live updates for wallet / withdrawals (pass JWT as ?token=). */
  @Sse('events')
  events(@Query('token') token: string): Observable<MessageEvent> {
    return this.svc.subscribeEvents(token || '');
  }

  @Sse('events/admin')
  adminEvents(@Query('token') token: string): Observable<MessageEvent> {
    return this.svc.subscribeAdminEvents(token || '');
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  broadcast(@Body() body: { title: string; body: string; type?: string }) {
    return this.svc.broadcast(body);
  }
}
