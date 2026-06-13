import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class FinalizePlanSaleDto {
  @IsOptional()
  @IsMongoId()
  saleId?: string;

  @IsMongoId()
  paymentId: string;
}
