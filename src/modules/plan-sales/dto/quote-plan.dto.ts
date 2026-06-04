import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class QuotePlanDto {
  @ApiProperty()
  @IsMongoId()
  planId: string;

  @ApiPropertyOptional({ description: 'Admin discount coupon or member referral code' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
