import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plan, PlanDocument } from './plan.schema';
import { Course, CourseDocument } from '../courses/course.schema';
import {
  LandingPricing,
  LandingPricingDocument,
  LandingPricingTier,
} from '../public/schemas/landing-pricing.schema';
import { DEFAULT_LANDING_PRICING_TIERS } from '../public/public.defaults';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(LandingPricing.name)
    private landingPricingModel: Model<LandingPricingDocument>,
  ) {}

  async create(plan: Partial<Plan>): Promise<Plan> {
    const createdPlan = new this.planModel(plan);
    return createdPlan.save();
  }

  /** Upsert sellable plans from admin “Plans & pricing” tiers. */
  async syncFromLandingPricing(): Promise<void> {
    const doc = await this.landingPricingModel.findOne({ key: 'default' }).lean().exec();
    const tiers: LandingPricingTier[] =
      doc?.tiers?.length ? doc.tiers : DEFAULT_LANDING_PRICING_TIERS;
    const tierIds = tiers.map((t) => t.id);

    await this.planModel
      .updateMany({ tierId: { $exists: true, $nin: tierIds } }, { $set: { active: false } })
      .exec();

    for (const tier of tiers) {
      const courseIds = (tier.courseIds ?? [])
        .map((id) => id?.trim())
        .filter((id) => id && Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id!));
      await this.planModel
        .findOneAndUpdate(
          { tierId: tier.id },
          {
            $set: {
              tierId: tier.id,
              name: tier.name,
              price: tier.price,
              period: tier.period,
              features: tier.features ?? [],
              courseIds,
              active: true,
            },
          },
          { upsert: true, new: true },
        )
        .exec();
    }
  }

  async getCourseIdsForPlan(planId: string | Types.ObjectId): Promise<Types.ObjectId[]> {
    const plan = await this.planModel.findById(planId).select('courseIds').lean().exec();
    return ((plan as any)?.courseIds ?? []) as Types.ObjectId[];
  }

  async planIncludesCourse(planId: string | Types.ObjectId, courseOid: Types.ObjectId): Promise<boolean> {
    const courses = await this.findPublishedCoursesForMembership(planId);
    return courses.some((c) => (c as any)._id.equals(courseOid));
  }

  /**
   * Only courses explicitly linked to this membership plan (admin Plans & pricing).
   * No fallback to full catalog — buyer sees exactly what their purchased tier includes.
   */
  async findPublishedCoursesForMembership(planId: string | Types.ObjectId): Promise<Course[]> {
    const plan = await this.planModel.findById(planId).select('courseIds name tierId').lean().exec();
    if (!plan) return [];

    const attached = ((plan as any).courseIds ?? []) as Types.ObjectId[];
    if (!attached.length) return [];

    return this.courseModel
      .find({ _id: { $in: attached }, isPublished: true })
      .sort({ heroOrder: 1, createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Plan[]> {
    await this.syncFromLandingPricing();
    return this.planModel.find().sort({ price: 1 }).exec();
  }

  async findActive(): Promise<Plan[]> {
    await this.syncFromLandingPricing();
    return this.planModel.find({ active: true }).sort({ price: 1 }).exec();
  }

  async findById(id: string): Promise<Plan | null> {
    return this.planModel.findById(id).exec();
  }

  /** Resolve plan by Mongo id or landing tier id (`pro`, `elite`, …). */
  async resolvePlan(idOrTierId: string): Promise<Plan | null> {
    await this.syncFromLandingPricing();
    const key = idOrTierId?.trim();
    if (!key) return null;
    if (Types.ObjectId.isValid(key)) {
      const byId = await this.planModel.findById(key).exec();
      if (byId) return byId;
    }
    return this.planModel.findOne({ tierId: key, active: true }).exec();
  }

  async resolvePlanOrThrow(idOrTierId: string): Promise<Plan> {
    const plan = await this.resolvePlan(idOrTierId);
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }
}
