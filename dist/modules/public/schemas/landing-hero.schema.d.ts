import { Document } from 'mongoose';
export type LandingHeroDocument = LandingHero & Document;
export declare class LandingHero {
    key: string;
    slides: Array<{
        eyebrow: string;
        title: string;
        highlight: string;
        suffix: string;
        description: string;
        imageUrl?: string;
        videoUrl?: string;
    }>;
    trustPills: string[];
    announcementBadge: string;
    visualMeta: Array<{
        chip: string;
        metricLabel: string;
        metricValue: string;
        metricHint: string;
    }>;
    referralBonusLabel: string;
    statCards: Array<{
        key: string;
        value: number;
        suffix: string;
        label: string;
    }>;
    offers: Array<{
        id: string;
        title: string;
        subtitle: string;
        cta: string;
        tone: 'primary' | 'accent' | 'dark';
    }>;
}
export declare const LandingHeroSchema: import("mongoose").Schema<LandingHero, import("mongoose").Model<LandingHero, any, any, any, Document<unknown, any, LandingHero, any, {}> & LandingHero & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LandingHero, Document<unknown, {}, import("mongoose").FlatRecord<LandingHero>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LandingHero> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
