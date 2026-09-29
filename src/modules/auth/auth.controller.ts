import { Controller, Request, Post, UseGuards, Body, Get, Query, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  LoginDto,
  SignupDto,
  RefreshDto,
  ForgotPasswordSendOtpDto,
  ForgotPasswordResetDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body.name, body.email, body.password, body.referralCode);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req.user._id.toString());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    const u = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete u.password;
    delete u.refreshTokenHash;
    return u;
  }

  @Post('send-verification-otp')
  @UseGuards(JwtAuthGuard)
  async sendVerificationOtp(@Request() req) {
    return this.authService.sendVerificationOtp(req.user._id.toString());
  }

  @Post('verify-email-otp')
  @UseGuards(JwtAuthGuard)
  async verifyEmailOtp(@Request() req, @Body() body: { otp: string }) {
    return this.authService.verifyEmailOtp(req.user._id.toString(), body.otp);
  }

  @Get('verify-email')
  async verifyEmailByToken(@Query('token') token: string, @Res() res) {
    const frontendUrl = this.authService.getFrontendUrl().replace(/\/$/, '');
    try {
      await this.authService.verifyEmailByToken(token);
      return res.redirect(`${frontendUrl}/profile?verified=1`);
    } catch {
      return res.redirect(`${frontendUrl}/profile?verified=error`);
    }
  }

  @Post('verify-email-token')
  async verifyEmailTokenPost(@Body() body: { token: string }) {
    return this.authService.verifyEmailByToken(body.token);
  }

  @Post('forgot-password/send-otp')
  async forgotPasswordSendOtp(@Body() body: ForgotPasswordSendOtpDto) {
    return this.authService.sendPasswordResetOtp(body.email);
  }

  @Post('forgot-password/reset')
  async forgotPasswordReset(@Body() body: ForgotPasswordResetDto) {
    return this.authService.resetPassword(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordResetDto) {
    if (!body.newPassword && body.email && !body.otp && !body.currentPassword) {
      return this.authService.sendPasswordResetOtp(body.email);
    }
    return this.authService.resetPassword(body);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.user._id.toString(), body.currentPassword, body.newPassword);
  }
}
