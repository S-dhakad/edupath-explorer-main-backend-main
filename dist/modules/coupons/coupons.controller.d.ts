import { PurchasesService } from '../purchases/purchases.service';
import { ConfigService } from '@nestjs/config';
import { PromoCouponsService } from './promo-coupons.service';
import { UsersService } from '../users/users.service';
export declare class CouponsController {
    private purchases;
    private config;
    private promoCoupons;
    private usersService;
    constructor(purchases: PurchasesService, config: ConfigService, promoCoupons: PromoCouponsService, usersService: UsersService);
    validate(user: any, body: {
        code: string;
    }): Promise<{
        valid: true;
        code: string;
        referrerName: string;
    }>;
    me(user: any): Promise<{
        code: any;
        unlocked: boolean;
        referralLink: any;
        qrData: any;
        message: string;
    } | {
        code: any;
        unlocked: boolean;
        referralLink: string;
        qrData: string;
        message?: undefined;
    }>;
    performance(user: any, page?: string, limit?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("../purchases/purchase.schema").PurchaseDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    adminList(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    adminCreate(body: any): Promise<import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    adminUpdate(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("./promo-coupon.schema").PromoCoupon, {}, {}> & import("./promo-coupon.schema").PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    adminDelete(id: string): Promise<{
        deleted: boolean;
    }>;
}
