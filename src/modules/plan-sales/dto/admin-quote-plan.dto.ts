import { IsMongoId, IsString, MinLength } from 'class-validator';

export class AdminQuotePlanDto {
  @IsMongoId()
  planId: string;

  @IsString()
  @MinLength(2)
  promoCode: string;
}
