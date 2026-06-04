import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email, true);
    if (user && (await bcrypt.compare(password, user.password))) {
      const result = user.toObject ? user.toObject() : { ...(user as any) };
      delete result.password;
      return result;
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
}
