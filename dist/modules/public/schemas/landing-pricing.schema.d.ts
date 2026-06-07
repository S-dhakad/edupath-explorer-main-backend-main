import { Document } from 'mongoose';
export type LandingPricingDocument = LandingPricing & Document;
export type LandingPricingTier = {
    id: string;
    name: string;
    tagline: string;
    price: number;
    promoPrice?: number;
    period: string;
    features: string[];
    highlight?: boolean;
    badge?: string;
    chip: string;
    savings: string;
    description: string;
    accent: string;
    courseIds?: string[];
    showOnLanding?: boolean;
};
export type LandingPricingCompareRow = {
    label: string;
    cells: string[];
};
export declare class LandingPricing {
    key: string;
    tiers: LandingPricingTier[];
    compareRows: LandingPricingCompareRow[];
}
export declare const LandingPricingSchema: import("mongoose").Schema<LandingPricing, import("mongoose").Model<LandingPricing, any, any, any, Document<unknown, any, LandingPricing, any, {}> & LandingPricing & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LandingPricing, Document<unknown, {}, import("mongoose").FlatRecord<LandingPricing>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LandingPricing> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
