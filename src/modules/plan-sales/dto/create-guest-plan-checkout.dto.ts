import { IsEmail, IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateGuestPlanCheckoutDto {
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

  @IsString()
  @MinLength(4)
  promoCode: string;

  @IsMongoId()
  planId: string;
}
