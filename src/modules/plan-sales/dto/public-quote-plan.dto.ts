import { IsMongoId, IsString, MinLength } from 'class-validator';

export class PublicQuotePlanDto {
  @IsMongoId()
  planId: string;

  @IsString()
  @MinLength(4)
  promoCode: string;
}
