import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlanSalesService } from './plan-sales.service';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { FinalizePlanSaleDto } from './dto/finalize-plan-sale.dto';
import { QuotePlanDto } from './dto/quote-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/app.constants';
import { PlanSaleStatus } from './plan-sale.schema';

@ApiTags('plan-sales')
@Controller('plan-sales')
export class PlanSalesController {
  constructor(private readonly svc: PlanSalesService) {}

  @Post('quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  quote(@Body() dto: QuotePlanDto) {
    return this.svc.quoteCheckout(dto.planId, dto.promoCode);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() dto: CreatePlanSaleDto) {
    return this.svc.initiateAffiliateCheckout(user._id.toString(), dto);
  }

  @Post('checkout-self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkoutSelf(@CurrentUser() user: any, @Body() dto: PurchasePlanSelfDto) {
    return this.svc.initiateSelfCheckout(user._id.toString(), dto);
  }

  @Post('finalize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  finalize(@CurrentUser() user: any, @Body() dto: FinalizePlanSaleDto) {
    return this.svc.finalizeCheckout(user._id.toString(), dto.saleId, dto.paymentId);
  }

  @Post('purchase-self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  purchaseSelf(@CurrentUser() user: any, @Body() dto: PurchasePlanSelfDto) {
    return this.svc.purchaseSelf(user._id.toString(), dto);
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
  adminList(
    @Query('status') status?: PlanSaleStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listAll({
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch('admin/:id/paid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  markPaid(@Param('id') id: string, @Body() body: { adminNote?: string }) {
    return this.svc.markPaid(id, body.adminNote);
  }
}
