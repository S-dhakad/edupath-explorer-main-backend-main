import { Document } from 'mongoose';
export type PlatformSettingsDocument = PlatformSettings & Document;
export declare class PlatformSettings {
    key: string;
    couponOwnerPercent: number;
    platformPercent: number;
    directParentPercent: number;
    memberPromoBuyerDiscountPercent: number;
    fraudBlockSelfReferral: boolean;
    fraudBlockCouponOwnerPurchase: boolean;
}
export declare const PlatformSettingsSchema: import("mongoose").Schema<PlatformSettings, import("mongoose").Model<PlatformSettings, any, any, any, Document<unknown, any, PlatformSettings, any, {}> & PlatformSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlatformSettings, Document<unknown, {}, import("mongoose").FlatRecord<PlatformSettings>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PlatformSettings> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
