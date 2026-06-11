import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, SignupDto, RefreshDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    signup(body: SignupDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    refresh(body: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    logout(req: any): Promise<{
        ok: boolean;
    }>;
    me(req: any): Promise<any>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    changePassword(req: any, body: ChangePasswordDto): Promise<{
        ok: boolean;
        message: string;
    }>;
}
