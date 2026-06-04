import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { PurchasesService } from '../purchases/purchases.service';
import { WalletService } from '../wallet/wallet.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CoursesService } from '../courses/courses.service';
import { PlansService } from '../plans/plans.service';
import { KycService } from '../kyc/kyc.service';
import { Types } from 'mongoose';
export declare class UsersController {
    private usersService;
    private purchasesService;
    private coursesService;
    private config;
    private walletService;
    private analyticsService;
    private plansService;
    private kycService;
    constructor(usersService: UsersService, purchasesService: PurchasesService, coursesService: CoursesService, config: ConfigService, walletService: WalletService, analyticsService: AnalyticsService, plansService: PlansService, kycService: KycService);
    getCourseCurriculum(req: any, slug: string): Promise<{
        slug: string;
        title: string;
        modules: any;
    }>;
    getDashboard(req: any): Promise<{
        error: string;
    } | {
        totalIncome: number;
        activeIncome: number;
        passiveIncome: number;
        totalActive: any;
        totalPassive: any;
        lifetimeEarnings: any;
        todayIncome: any;
        weeklyIncome: any;
        monthlyIncome: any;
        totalCourseSales: number;
        user: import("./user.schema").UserDocument;
        kycStatus: string;
        activeMembership: {
            planId: string;
            planName: string;
            tierId?: string;
            courseCount: number;
        };
        referrals: number;
        referralList: import("./user.schema").UserDocument[];
        myPurchases: import("../purchases/purchase.schema").Purchase[];
        planCourses: import("../public/course-mapper").ExplorerCourseDto[];
        planName: string;
        affiliateSales: any[];
        wallet: import("mongoose").Document<unknown, {}, import("../wallet/schemas/wallet.schema").WalletDocument, {}, {}> & import("../wallet/schemas/wallet.schema").Wallet & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        conversionRate: number;
        error?: undefined;
    }>;
}
