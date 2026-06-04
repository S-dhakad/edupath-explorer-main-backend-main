import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './purchase.schema';
import { PaymentDocument } from '../payment/schemas/payment.schema';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { RevenueDistributionService } from '../commission/revenue-distribution.service';
import { SettingsService } from '../settings/settings.service';
import { PlansService } from '../plans/plans.service';
export declare class PurchasesService {
    private purchaseModel;
    private paymentModel;
    private usersService;
    private coursesService;
    private revenueDistributionService;
    private settingsService;
    private plansService;
    constructor(purchaseModel: Model<PurchaseDocument>, paymentModel: Model<PaymentDocument>, usersService: UsersService, coursesService: CoursesService, revenueDistributionService: RevenueDistributionService, settingsService: SettingsService, plansService: PlansService);
    hasCourseAccess(userId: string, courseOid: Types.ObjectId): Promise<boolean>;
    effectiveCoursePrice(course: any): number;
    create(purchase: Partial<Purchase> & {
        buyerId: string;
    }): Promise<Purchase>;
    findByUser(userId: string): Promise<Purchase[]>;
    hasCompletedCourseAccess(userId: string, courseObjectId: Types.ObjectId): Promise<boolean>;
    findByCoupon(coupon: string): Promise<Purchase[]>;
    listAffiliateSales(couponCode: string, opts: {
        from?: Date;
        to?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<PurchaseDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
