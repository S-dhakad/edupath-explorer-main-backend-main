import { IsEmail, IsIn, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export const ADMIN_OFFLINE_PAYMENT_METHODS = [
  'cash',
  'upi',
  'bank_transfer',
  'card',
  'other',
] as const;

export type AdminOfflinePaymentMethod = (typeof ADMIN_OFFLINE_PAYMENT_METHODS)[number];

export class AdminCreatePlanSaleDto {
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
  @MinLength(2)
  promoCode: string;

  @IsMongoId()
  planId: string;

  @IsIn([...ADMIN_OFFLINE_PAYMENT_METHODS])
  paymentMethod: AdminOfflinePaymentMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
