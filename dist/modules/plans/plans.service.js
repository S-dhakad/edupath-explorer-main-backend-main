"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const plan_schema_1 = require("./plan.schema");
const course_schema_1 = require("../courses/course.schema");
const landing_pricing_schema_1 = require("../public/schemas/landing-pricing.schema");
const public_defaults_1 = require("../public/public.defaults");
let PlansService = class PlansService {
    constructor(planModel, courseModel, landingPricingModel) {
        this.planModel = planModel;
        this.courseModel = courseModel;
        this.landingPricingModel = landingPricingModel;
    }
    async create(plan) {
        const createdPlan = new this.planModel(plan);
        return createdPlan.save();
    }
    async syncFromLandingPricing() {
        const doc = await this.landingPricingModel.findOne({ key: 'default' }).lean().exec();
        const tiers = doc?.tiers?.length ? doc.tiers : public_defaults_1.DEFAULT_LANDING_PRICING_TIERS;
        const tierIds = tiers.map((t) => t.id);
        await this.planModel
            .updateMany({ tierId: { $exists: true, $nin: tierIds } }, { $set: { active: false } })
            .exec();
        for (const tier of tiers) {
            const courseIds = (tier.courseIds ?? [])
                .map((id) => id?.trim())
                .filter((id) => id && mongoose_2.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_2.Types.ObjectId(id));
            await this.planModel
                .findOneAndUpdate({ tierId: tier.id }, {
                $set: {
                    tierId: tier.id,
                    name: tier.name,
                    price: tier.price,
                    period: tier.period,
                    features: tier.features ?? [],
                    courseIds,
                    active: true,
                },
            }, { upsert: true, new: true })
                .exec();
        }
    }
    async getCourseIdsForPlan(planId) {
        const plan = await this.planModel.findById(planId).select('courseIds').lean().exec();
        return (plan?.courseIds ?? []);
    }
    async planIncludesCourse(planId, courseOid) {
        const courses = await this.findPublishedCoursesForMembership(planId);
        return courses.some((c) => c._id.equals(courseOid));
    }
    async findPublishedCoursesForMembership(planId) {
        const plan = await this.planModel.findById(planId).select('courseIds name tierId').lean().exec();
        if (!plan)
            return [];
        const attached = (plan.courseIds ?? []);
        if (!attached.length)
            return [];
        return this.courseModel
            .find({ _id: { $in: attached }, isPublished: true })
            .sort({ heroOrder: 1, createdAt: -1 })
            .exec();
    }
    async findAll() {
        await this.syncFromLandingPricing();
        return this.planModel.find().sort({ price: 1 }).exec();
    }
    async findActive() {
        await this.syncFromLandingPricing();
        return this.planModel.find({ active: true }).sort({ price: 1 }).exec();
    }
    async findById(id) {
        return this.planModel.findById(id).exec();
    }
    async resolvePlan(idOrTierId) {
        await this.syncFromLandingPricing();
        const key = idOrTierId?.trim();
        if (!key)
            return null;
        if (mongoose_2.Types.ObjectId.isValid(key)) {
            const byId = await this.planModel.findById(key).exec();
            if (byId)
                return byId;
        }
        return this.planModel.findOne({ tierId: key, active: true }).exec();
    }
    async resolvePlanOrThrow(idOrTierId) {
        const plan = await this.resolvePlan(idOrTierId);
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(plan_schema_1.Plan.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(2, (0, mongoose_1.InjectModel)(landing_pricing_schema_1.LandingPricing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PlansService);
//# sourceMappingURL=plans.service.js.map