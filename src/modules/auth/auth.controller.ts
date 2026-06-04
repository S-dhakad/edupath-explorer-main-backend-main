import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, SignupDto, RefreshDto } from './dto/auth.dto';

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
}
