import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<any>;
    private sanitizeUser;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    signup(name: string, email: string, password: string, referralCode?: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    logout(userId: string): Promise<{
        ok: boolean;
    }>;
}
