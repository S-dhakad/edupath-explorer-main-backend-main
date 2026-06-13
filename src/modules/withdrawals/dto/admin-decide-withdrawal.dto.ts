import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export const ADMIN_MANUAL_PAYOUT_METHODS = [
  'cash',
  'upi',
  'bank_transfer',
  'card',
  'other',
] as const;

export type AdminManualPayoutMethod = (typeof ADMIN_MANUAL_PAYOUT_METHODS)[number];

export class AdminDecideWithdrawalDto {
  @IsBoolean()
  approve: boolean;

  @IsOptional()
  @IsString()
  adminNote?: string;

  /** Default manual — RazorpayX optional for a later phase. */
  @IsOptional()
  @IsIn(['manual', 'razorpayx'])
  payoutMode?: 'manual' | 'razorpayx';

  @IsOptional()
  @IsIn([...ADMIN_MANUAL_PAYOUT_METHODS])
  paymentMethod?: AdminManualPayoutMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
