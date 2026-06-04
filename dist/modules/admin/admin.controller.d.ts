import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { Model } from 'mongoose';
import { CommissionDocument } from '../commission/schemas/commission.schema';
import { KycDocument } from '../kyc/schemas/kyc.schema';
import { WithdrawalDocument } from '../withdrawals/withdrawal.schema';
export declare class AdminController {
    private users;
    private coursesService;
    private readonly config;
    private commissionModel;
    private kycModel;
    private withdrawalModel;
    constructor(users: UsersService, coursesService: CoursesService, config: ConfigService, commissionModel: Model<CommissionDocument>, kycModel: Model<KycDocument>, withdrawalModel: Model<WithdrawalDocument>);
    stats(): Promise<{
        totalUsers: number;
        totalCourses: number;
        platformRevenue: any;
        pendingKyc: number;
        pendingWithdrawals: number;
    }>;
    listUsers(page?: string, limit?: string, search?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("../users/user.schema").UserDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    ban(id: string, value?: string): Promise<import("mongoose").Document<unknown, {}, import("../users/user.schema").UserDocument, {}, {}> & import("../users/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    verify(id: string, value?: string): Promise<import("mongoose").Document<unknown, {}, import("../users/user.schema").UserDocument, {}, {}> & import("../users/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    referrals(id: string): Promise<any>;
    listCourses(): Promise<import("../courses/course.schema").Course[]>;
    uploadCourseVideo(file: {
        path: string;
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
    } | undefined, req: Request): Promise<{
        path: string;
        url: string;
        filename: string;
        size: number;
    }>;
    uploadMedia(file: {
        path: string;
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
    } | undefined, req: Request): Promise<{
        path: string;
        url: string;
        filename: string;
        size: number;
    }>;
}
