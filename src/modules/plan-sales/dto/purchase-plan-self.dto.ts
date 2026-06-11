import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class PurchasePlanSelfDto {
  /** Landing tier id (e.g. `pro`) or Mongo plan id */
  @IsString()
  planTierId: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MinLength(8)
  contactNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
