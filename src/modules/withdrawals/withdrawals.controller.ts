import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RazorpayPayoutService } from '../payout/razorpay-payout.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { WithdrawalStatus } from '../../common/constants/app.constants';

@ApiTags('withdrawals')
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(
    private readonly svc: WithdrawalsService,
    private readonly razorpayPayout: RazorpayPayoutService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  request(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.request(user._id.toString(), body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  mine(@CurrentUser() user: any) {
    return this.svc.listMine(user._id.toString());
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminList(@Query('status') status?: WithdrawalStatus, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.listAll({
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  decide(
    @CurrentUser() admin: { _id: { toString(): string } },
    @Param('id') id: string,
    @Body() body: { approve: boolean; adminNote?: string },
  ) {
    return this.svc.decide(id, body.approve, body.adminNote, admin._id.toString());
  }

  @Post('admin/:id/sync-payout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  syncPayout(@Param('id') id: string) {
    return this.svc.syncPayoutStatus(id);
  }

  @Post('webhook/razorpayx')
  async razorpayxWebhook(
    @Req() req: { rawBody?: Buffer; body?: unknown },
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: unknown,
  ) {
    const raw =
      req.rawBody?.toString('utf8') ||
      (typeof body === 'string' ? body : JSON.stringify(body ?? {}));
    if (signature && !this.razorpayPayout.verifyWebhookSignature(raw, signature)) {
      return { ok: false, error: 'invalid signature' };
    }
    return this.svc.handleRazorpayWebhook(
      body as {
        event?: string;
        payload?: {
          payout?: {
            entity?: {
              id?: string;
              status?: string;
              reference_id?: string;
              failure_reason?: string;
            };
          };
        };
      },
    );
  }
}
