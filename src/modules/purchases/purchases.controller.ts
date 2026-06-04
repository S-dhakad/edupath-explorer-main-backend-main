import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() purchase: Partial<any>, @Request() req) {
    return this.purchasesService.create({
      ...purchase,
      buyerId: req.user._id.toString(),
    });
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req) {
    return this.purchasesService.findByUser(req.user._id.toString());
  }

  @Get('coupon/:coupon')
  @UseGuards(JwtAuthGuard)
  async findByCoupon(@Param('coupon') coupon: string) {
    return this.purchasesService.findByCoupon(coupon);
  }
}