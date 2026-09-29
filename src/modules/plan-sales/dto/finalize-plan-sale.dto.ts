import { IsMongoId, IsString } from 'class-validator';

export class FinalizePlanSaleDto {
  @IsMongoId()
  saleId: string;

  @IsMongoId()
  paymentId: string;
}
