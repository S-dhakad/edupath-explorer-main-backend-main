import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlanSalesService } from './plan-sales.service';
import { CreatePlanSaleDto } from './dto/create-plan-sale.dto';
import { CreateGuestPlanCheckoutDto } from './dto/create-guest-plan-checkout.dto';
import { PurchasePlanSelfDto } from './dto/purchase-plan-self.dto';
import { FinalizePlanSaleDto } from './dto/finalize-plan-sale.dto';
import { QuotePlanDto } from './dto/quote-plan.dto';
import { PublicQuotePlanDto } from './dto/public-quote-plan.dto';
import { AdminQuotePlanDto } from './dto/admin-quote-plan.dto';
import { AdminCreatePlanSaleDto } from './dto/admin-create-plan-sale.dto';
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
  quote(@CurrentUser() user: any, @Body() dto: QuotePlanDto) {
    return this.svc.quoteCheckout(dto.planId, dto.promoCode, user?._id?.toString());
  }

  @Post('public/quote')
  publicQuote(@Body() dto: PublicQuotePlanDto) {
    return this.svc.publicQuoteCheckout(dto.planId, dto.promoCode);
  }

  @Post('public/checkout')
  publicCheckout(@Body() dto: CreateGuestPlanCheckoutDto) {
    return this.svc.initiateGuestCheckout(dto);
  }

  @Post('public/finalize')
  publicFinalize(@Body() dto: FinalizePlanSaleDto) {
    return this.svc.finalizeGuestCheckout(dto.paymentId);
  }

  @Get('upgrade-options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  upgradeOptions(@CurrentUser() user: any) {
    return this.svc.getUpgradeOptions(user._id.toString());
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
    return this.svc.finalizeCheckout(user._id.toString(), dto.paymentId, dto.saleId);
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

  @Post('admin/quote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminQuote(@Body() dto: AdminQuotePlanDto) {
    return this.svc.adminQuoteCheckout(dto.planId, dto.promoCode);
  }

  @Post('admin/sell')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  adminSell(@CurrentUser() user: any, @Body() dto: AdminCreatePlanSaleDto) {
    return this.svc.adminCreateOfflinePlanSale(user._id.toString(), dto);
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

  @Patch('admin/:id/decide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  decide(
    @Param('id') id: string,
    @Body() body: { approve: boolean; adminNote?: string },
  ) {
    return this.svc.adminDecidePlanSale(id, body.approve, body.adminNote);
  }
}
