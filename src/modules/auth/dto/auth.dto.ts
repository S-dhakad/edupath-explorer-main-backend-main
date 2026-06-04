import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email address (sent as username for Passport local)' })
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class SignupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refresh_token: string;
}
