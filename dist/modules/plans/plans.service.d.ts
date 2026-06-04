import { Model, Types } from 'mongoose';
import { Plan, PlanDocument } from './plan.schema';
import { Course, CourseDocument } from '../courses/course.schema';
import { LandingPricingDocument } from '../public/schemas/landing-pricing.schema';
export declare class PlansService {
    private planModel;
    private courseModel;
    private landingPricingModel;
    constructor(planModel: Model<PlanDocument>, courseModel: Model<CourseDocument>, landingPricingModel: Model<LandingPricingDocument>);
    create(plan: Partial<Plan>): Promise<Plan>;
    syncFromLandingPricing(): Promise<void>;
    getCourseIdsForPlan(planId: string | Types.ObjectId): Promise<Types.ObjectId[]>;
    planIncludesCourse(planId: string | Types.ObjectId, courseOid: Types.ObjectId): Promise<boolean>;
    findPublishedCoursesForMembership(planId: string | Types.ObjectId): Promise<Course[]>;
    findAll(): Promise<Plan[]>;
    findActive(): Promise<Plan[]>;
    findById(id: string): Promise<Plan | null>;
    resolvePlan(idOrTierId: string): Promise<Plan | null>;
    resolvePlanOrThrow(idOrTierId: string): Promise<Plan>;
}
