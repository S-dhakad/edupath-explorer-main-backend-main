import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, true);
    if (user) {
      const match =
        user.password === password ||
        (user.password?.startsWith('$2')
          ? await bcrypt.compare(password, user.password).catch(() => false)
          : false);
      if (match) {
        const result = user.toObject ? user.toObject() : { ...(user as any) };
        delete result.password;
        return result;
      }
    }
    return null;
  }

  private sanitizeUser(user: any) {
    const o = user.toObject ? user.toObject() : { ...user };
    delete o.password;
    delete o.refreshTokenHash;
    delete o.emailVerificationToken;
    return o;
  }

  async login(user: any) {
    if (user.isBanned) throw new UnauthorizedException('Account suspended');
    if (user.accountActive === false) {
      throw new UnauthorizedException(
        'Account is not active yet. Complete payment or contact support.',
      );
    }
    const accessSecret = this.configService.get<string>('jwt.accessSecret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpires = this.configService.get<string>('jwt.accessExpires');
    const refreshExpires = this.configService.get<string>('jwt.refreshExpires');

    const payload = { email: user.email, sub: user._id.toString(), role: user.role };
    const access_token = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: accessExpires as any,
    });
    const refresh_token = this.jwtService.sign(
      { sub: user._id.toString(), type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpires as any },
    );
    const hash = await bcrypt.hash(refresh_token, 10);
    await this.usersService.updateRefreshTokenHash(user._id.toString(), hash);
    return {
      access_token,
      refresh_token,
      user: this.sanitizeUser(user),
    };
  }

  async signup(name: string, email: string, password: string, referralCode?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await this.usersService.findByReferralCode(referralCode.toUpperCase());
      if (referrer) referredBy = (referrer as any)._id.toString();
    }
    const user = await this.usersService.create({ name, email, password, referredBy } as any);
    const uid = (user as any)._id.toString();
    if (referralCode && referredBy) {
      await this.usersService.setLockedAffiliateCouponIfUnset(uid, referralCode);
    }
    const fresh = await this.usersService.findById(uid);
    return this.login(fresh);
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
    const user = await this.usersService.findWithRefreshHash(payload.sub);
    if (!user || user.isBanned) throw new UnauthorizedException();
    const match = user.refreshTokenHash && (await bcrypt.compare(refreshToken, user.refreshTokenHash));
    if (!match) throw new UnauthorizedException('Refresh token revoked');
    const u = user.toObject ? user.toObject() : { ...user };
    delete u.password;
    delete u.refreshTokenHash;
    return this.login(u);
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { ok: true };
  }

  getFrontendUrl(): string {
    return this.configService.get<string>('frontendUrl') || 'http://localhost:5173';
  }

  async sendVerificationOtp(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) {
      return { ok: true, message: 'Email is already verified', alreadyVerified: true };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = uuidv4();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.usersService.setVerificationOtp(userId, otp, token, expires);
    await this.mailService.sendVerificationOtp(user.email, user.name, otp, token);

    return {
      ok: true,
      message: `Verification code sent to ${user.email}`,
      email: user.email,
    };
  }

  async verifyEmailOtp(userId: string, otp: string) {
    if (!otp || otp.trim().length !== 6) {
      throw new BadRequestException('Please enter a valid 6-digit OTP code');
    }
    const success = await this.usersService.verifyOtp(userId, otp.trim());
    if (!success) {
      throw new BadRequestException('Invalid or expired OTP code. Please request a new code.');
    }
    return { ok: true, message: 'Email verified successfully!' };
  }

  async verifyEmailByToken(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is missing');
    }
    const success = await this.usersService.verifyToken(token);
    if (!success) {
      throw new BadRequestException('Verification link is invalid or has expired.');
    }
    return { ok: true, message: 'Email verified successfully!' };
  }

  async sendPasswordResetOtp(email: string) {
    if (!email?.trim()) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }
    if (user.isBanned) {
      throw new BadRequestException('This account has been suspended. Please contact support.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.usersService.setPasswordResetOtp((user as any)._id.toString(), otp, expires);
    await this.mailService.sendPasswordResetOtp(user.email, user.name, otp);

    return {
      ok: true,
      message: `Password reset code sent to ${user.email}`,
      email: user.email,
    };
  }

  async resetPassword(body: { email: string; otp?: string; currentPassword?: string; newPassword: string }) {
    if (!body.email?.trim()) {
      throw new BadRequestException('Email is required');
    }
    if (!body.newPassword || body.newPassword.trim().length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    if (body.otp && body.otp.trim()) {
      return this.usersService.resetPasswordWithOtp(body.email, body.otp, body.newPassword);
    }
    if (body.currentPassword && body.currentPassword.trim()) {
      return this.usersService.resetPasswordWithCurrentPassword(body.email, body.currentPassword, body.newPassword);
    }
    throw new BadRequestException('Please provide either the 6-digit OTP code or current password');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.resetPasswordWithCurrentPassword(user.email, currentPassword, newPassword);
  }
}
