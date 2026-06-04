import { Document, Types } from 'mongoose';
import { UserRole, AffiliateRank } from '../../common/constants/app.constants';
export type UserDocument = User & Document;
export declare class User {
    name: string;
    email: string;
    password: string;
    referralCode: string;
    referredBy: Types.ObjectId | null;
    lockedAffiliateCoupon: string | null;
    role: UserRole;
    emailVerified: boolean;
    emailVerificationToken: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    refreshTokenHash: string;
    accountActive: boolean;
    age: number;
    dateOfBirth: Date;
    isBanned: boolean;
    isVerifiedSeller: boolean;
    rank: AffiliateRank;
    planId: Types.ObjectId | null;
    activeIncome: number;
    passiveIncome: number;
    totalReferralsCount: number;
    directReferralsCount: number;
    googleId: string;
    facebookId: string;
    avatarUrl: string;
    phone: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
