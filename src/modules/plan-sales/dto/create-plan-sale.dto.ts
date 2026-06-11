import { IsEmail, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePlanSaleDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  @MinLength(8)
  contactNumber: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsMongoId()
  planId: string;
}
