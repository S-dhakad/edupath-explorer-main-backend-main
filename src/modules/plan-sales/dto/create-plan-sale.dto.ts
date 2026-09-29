import { IsEmail, IsInt, IsMongoId, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePlanSaleDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

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
  promoCode?: string;

  @IsMongoId()
  planId: string;
}
