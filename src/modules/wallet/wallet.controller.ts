import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@CurrentUser() user: any) {
    const w = await this.walletService.getOrCreate((user as any)._id.toString());
    return w;
  }

  @Get('me/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async txs(@CurrentUser() user: any, @Query() q: PaginationQueryDto) {
    return this.walletService.listForUser((user as any)._id.toString(), q.page, q.limit);
  }
}
