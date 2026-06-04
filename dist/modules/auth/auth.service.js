"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email, true);
        if (user && (await bcrypt.compare(password, user.password))) {
            const result = user.toObject ? user.toObject() : { ...user };
            delete result.password;
            return result;
        }
        return null;
    }
    sanitizeUser(user) {
        const o = user.toObject ? user.toObject() : { ...user };
        delete o.password;
        delete o.refreshTokenHash;
        delete o.emailVerificationToken;
        return o;
    }
    async login(user) {
        if (user.isBanned)
            throw new common_1.UnauthorizedException('Account suspended');
        if (user.accountActive === false) {
            throw new common_1.UnauthorizedException('Account is not active yet. Complete payment or contact support.');
        }
        const accessSecret = this.configService.get('jwt.accessSecret');
        const refreshSecret = this.configService.get('jwt.refreshSecret');
        const accessExpires = this.configService.get('jwt.accessExpires');
        const refreshExpires = this.configService.get('jwt.refreshExpires');
        const payload = { email: user.email, sub: user._id.toString(), role: user.role };
        const access_token = this.jwtService.sign(payload, {
            secret: accessSecret,
            expiresIn: accessExpires,
        });
        const refresh_token = this.jwtService.sign({ sub: user._id.toString(), type: 'refresh' }, { secret: refreshSecret, expiresIn: refreshExpires });
        const hash = await bcrypt.hash(refresh_token, 10);
        await this.usersService.updateRefreshTokenHash(user._id.toString(), hash);
        return {
            access_token,
            refresh_token,
            user: this.sanitizeUser(user),
        };
    }
    async signup(name, email, password, referralCode) {
        const existing = await this.usersService.findByEmail(email);
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        let referredBy = null;
        if (referralCode) {
            const referrer = await this.usersService.findByReferralCode(referralCode.toUpperCase());
            if (referrer)
                referredBy = referrer._id.toString();
        }
        const user = await this.usersService.create({ name, email, password, referredBy });
        const uid = user._id.toString();
        if (referralCode && referredBy) {
            await this.usersService.setLockedAffiliateCouponIfUnset(uid, referralCode);
        }
        const fresh = await this.usersService.findById(uid);
        return this.login(fresh);
    }
    async refresh(refreshToken) {
        const refreshSecret = this.configService.get('jwt.refreshSecret');
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.type !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const user = await this.usersService.findWithRefreshHash(payload.sub);
        if (!user || user.isBanned)
            throw new common_1.UnauthorizedException();
        const match = user.refreshTokenHash && (await bcrypt.compare(refreshToken, user.refreshTokenHash));
        if (!match)
            throw new common_1.UnauthorizedException('Refresh token revoked');
        const u = user.toObject ? user.toObject() : { ...user };
        delete u.password;
        delete u.refreshTokenHash;
        return this.login(u);
    }
    async logout(userId) {
        await this.usersService.updateRefreshTokenHash(userId, null);
        return { ok: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map