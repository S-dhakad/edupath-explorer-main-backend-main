import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitContactInquiryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(2)
  topic: string;

  @IsString()
  @MinLength(12)
  message: string;
}
