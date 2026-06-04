import { Model } from 'mongoose';
import { PromoCoupon, PromoCouponDocument } from './promo-coupon.schema';
export declare class PromoCouponsService {
    private model;
    constructor(model: Model<PromoCouponDocument>);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[], import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "find", {}>;
    create(dto: Partial<PromoCoupon>): Promise<import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: Partial<PromoCoupon>): Promise<import("mongoose").Document<unknown, {}, PromoCoupon, {}, {}> & PromoCoupon & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    computeDiscount(code: string, subtotal: number): Promise<{
        kind: 'admin_coupon';
        code: string;
        discountAmount: number;
        finalSubtotal: number;
        label: string;
    } | null>;
    incrementUsage(code: string): Promise<void>;
}
