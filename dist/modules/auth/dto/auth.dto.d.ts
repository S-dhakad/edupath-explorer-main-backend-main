export declare class LoginDto {
    username: string;
    password: string;
}
export declare class SignupDto {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
}
export declare class RefreshDto {
    refresh_token: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
    currentPassword: string;
    newPassword: string;
}
