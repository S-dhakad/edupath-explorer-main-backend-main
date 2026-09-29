import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  dateOfBirth: string;

  @IsString()
  @MinLength(8)
  contactNumber: string;

  @IsOptional()
  @IsString()
  address?: string;
}
