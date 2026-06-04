import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { LandingHero, LandingHeroDocument } from './schemas/landing-hero.schema';
import { LandingPricing, LandingPricingDocument, LandingPricingTier, LandingPricingCompareRow } from './schemas/landing-pricing.schema';
import { CourseDocument } from '../courses/course.schema';
import { CategoryDocument } from '../categories/category.schema';
import { ExplorerCourseDto } from './course-mapper';
import { PatchLandingPricingDto } from './dto/patch-landing-pricing.dto';
import { PlansService } from '../plans/plans.service';
export { DEFAULT_LANDING_HERO, DEFAULT_LANDING_PRICING_TIERS, DEFAULT_PRICING_COMPARE_ROWS, } from './public.defaults';
export declare class PublicService {
    private readonly landingModel;
    private readonly landingPricingModel;
    private readonly courseModel;
    private readonly categoryModel;
    private readonly config;
    private readonly plansService;
    constructor(landingModel: Model<LandingHeroDocument>, landingPricingModel: Model<LandingPricingDocument>, courseModel: Model<CourseDocument>, categoryModel: Model<CategoryDocument>, config: ConfigService, plansService: PlansService);
    ensureLandingDoc(): Promise<LandingHeroDocument>;
    private categoryNameMap;
    getHeroPayload(): Promise<{
        slides: {
            eyebrow: string;
            title: string;
            highlight: string;
            suffix: string;
            description: string;
            imageUrl?: string;
            videoUrl?: string;
        }[];
        trustPills: string[];
        announcementBadge: string;
        visualMeta: {
            chip: string;
            metricLabel: string;
            metricValue: string;
            metricHint: string;
        }[];
        referralBonusLabel: string;
        statCards: {
            key: string;
            value: number;
            suffix: string;
            label: string;
        }[];
        offers: {
            id: string;
            title: string;
            subtitle: string;
            cta: string;
            tone: "primary" | "accent" | "dark";
        }[];
        courses: ExplorerCourseDto[];
    }>;
    getCourseBySlug(slug: string): Promise<ExplorerCourseDto>;
    listPublishedCoursesExplorer(): Promise<ExplorerCourseDto[]>;
    updateLandingHero(patch: Partial<LandingHero>): Promise<import("mongoose").Document<unknown, {}, LandingHeroDocument, {}, {}> & LandingHero & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    ensureLandingPricing(): Promise<LandingPricingDocument>;
    getPricingPlansPayload(): Promise<{
        tiers: LandingPricingTier[];
        compareRows: LandingPricingCompareRow[];
    }>;
    private validatePricingTiers;
    private validateCompareRows;
    updateLandingPricing(body: PatchLandingPricingDto): Promise<import("mongoose").Document<unknown, {}, LandingPricingDocument, {}, {}> & LandingPricing & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
