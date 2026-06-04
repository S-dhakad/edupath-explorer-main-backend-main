import { AnalyticsService } from './analytics.service';
import { Model } from 'mongoose';
import { CommissionDocument } from '../commission/schemas/commission.schema';
export declare class AnalyticsController {
    private readonly analytics;
    private commissionModel;
    constructor(analytics: AnalyticsService, commissionModel: Model<CommissionDocument>);
    summary(user: any): Promise<{
        totalActive: any;
        totalPassive: any;
        lifetimeEarnings: any;
        todayIncome: any;
        weeklyIncome: any;
        monthlyIncome: any;
        totalCourseSales: number;
    }>;
    earnings(user: any, g?: 'day' | 'week' | 'month', days?: string): Promise<any[]>;
    platformRevenue(): Promise<{
        platformRevenueTotal: any;
    }>;
    leaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'overall'): Promise<{
        rank: number;
        userId: any;
        name: any;
        email: any;
        avatarUrl: any;
        activeIncome: any;
        passiveIncome: any;
        totalEarnings: any;
    }[]>;
    incomeUsers(page?: string, limit?: string, search?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
    }>;
}
