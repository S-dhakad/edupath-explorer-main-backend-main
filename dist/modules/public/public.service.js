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
exports.PublicService = exports.DEFAULT_PRICING_COMPARE_ROWS = exports.DEFAULT_LANDING_PRICING_TIERS = exports.DEFAULT_LANDING_HERO = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const class_transformer_1 = require("class-transformer");
const mongoose_2 = require("mongoose");
const landing_hero_schema_1 = require("./schemas/landing-hero.schema");
const landing_pricing_schema_1 = require("./schemas/landing-pricing.schema");
const course_schema_1 = require("../courses/course.schema");
const category_schema_1 = require("../categories/category.schema");
const course_mapper_1 = require("./course-mapper");
const plans_service_1 = require("../plans/plans.service");
const public_defaults_1 = require("./public.defaults");
var public_defaults_2 = require("./public.defaults");
Object.defineProperty(exports, "DEFAULT_LANDING_HERO", { enumerable: true, get: function () { return public_defaults_2.DEFAULT_LANDING_HERO; } });
Object.defineProperty(exports, "DEFAULT_LANDING_PRICING_TIERS", { enumerable: true, get: function () { return public_defaults_2.DEFAULT_LANDING_PRICING_TIERS; } });
Object.defineProperty(exports, "DEFAULT_PRICING_COMPARE_ROWS", { enumerable: true, get: function () { return public_defaults_2.DEFAULT_PRICING_COMPARE_ROWS; } });
let PublicService = class PublicService {
    constructor(landingModel, landingPricingModel, courseModel, categoryModel, config, plansService) {
        this.landingModel = landingModel;
        this.landingPricingModel = landingPricingModel;
        this.courseModel = courseModel;
        this.categoryModel = categoryModel;
        this.config = config;
        this.plansService = plansService;
    }
    async ensureLandingDoc() {
        let doc = await this.landingModel.findOne({ key: 'default' }).exec();
        if (!doc) {
            doc = await this.landingModel.create({ ...public_defaults_1.DEFAULT_LANDING_HERO });
        }
        return doc;
    }
    async categoryNameMap() {
        const cats = await this.categoryModel.find().lean();
        const m = new Map();
        for (const c of cats) {
            m.set(c._id.toString(), c.name);
        }
        return m;
    }
    async getHeroPayload() {
        const landing = await this.ensureLandingDoc();
        const catMap = await this.categoryNameMap();
        const mediaBase = this.config.get('media.publicBase') || '';
        let featured = await this.courseModel
            .find({ isPublished: true, featuredOnHero: true })
            .sort({ heroOrder: 1, createdAt: -1 })
            .lean()
            .exec();
        if (!featured.length) {
            featured = await this.courseModel
                .find({ isPublished: true })
                .sort({ salesCount: -1, heroOrder: -1, createdAt: -1 })
                .limit(8)
                .lean()
                .exec();
        }
        const courses = featured.map((c) => (0, course_mapper_1.mapCourseToExplorerDto)(c, catMap.get(c.categoryId?.toString()) || '', mediaBase));
        return {
            slides: landing.slides?.length ? landing.slides : public_defaults_1.DEFAULT_LANDING_HERO.slides,
            trustPills: landing.trustPills?.length ? landing.trustPills : public_defaults_1.DEFAULT_LANDING_HERO.trustPills,
            announcementBadge: landing.announcementBadge || public_defaults_1.DEFAULT_LANDING_HERO.announcementBadge,
            visualMeta: landing.visualMeta?.length ? landing.visualMeta : public_defaults_1.DEFAULT_LANDING_HERO.visualMeta,
            referralBonusLabel: landing.referralBonusLabel || public_defaults_1.DEFAULT_LANDING_HERO.referralBonusLabel,
            statCards: landing.statCards?.length ? landing.statCards : public_defaults_1.DEFAULT_LANDING_HERO.statCards,
            offers: landing.offers?.length ? landing.offers : public_defaults_1.DEFAULT_LANDING_HERO.offers,
            courses,
        };
    }
    async getCourseBySlug(slug) {
        const c = await this.courseModel
            .findOne({ slug: slug.toLowerCase(), isPublished: true })
            .lean()
            .exec();
        if (!c)
            throw new common_1.NotFoundException('Course not found');
        const catMap = await this.categoryNameMap();
        const name = catMap.get(c.categoryId?.toString?.()) || '';
        const mediaBase = this.config.get('media.publicBase') || '';
        return (0, course_mapper_1.mapCourseToExplorerDto)(c, name, mediaBase);
    }
    async listPublishedCoursesExplorer() {
        const list = await this.courseModel
            .find({ isPublished: true })
            .sort({ salesCount: -1, createdAt: -1 })
            .lean()
            .exec();
        const catMap = await this.categoryNameMap();
        const mediaBase = this.config.get('media.publicBase') || '';
        return list.map((c) => (0, course_mapper_1.mapCourseToExplorerDto)(c, catMap.get(c.categoryId?.toString()) || 'General', mediaBase));
    }
    async updateLandingHero(patch) {
        const { key, ...rest } = patch;
        return this.landingModel
            .findOneAndUpdate({ key: 'default' }, { $set: rest }, { new: true, upsert: true })
            .exec();
    }
    isVisibleOnLanding(tier) {
        if (tier.showOnLanding === true)
            return true;
        if (tier.showOnLanding === false)
            return false;
        return public_defaults_1.DEFAULT_LANDING_VISIBLE_IDS.includes(tier.id);
    }
    plainTier(tier) {
        const raw = typeof tier.toObject === 'function'
            ? tier.toObject()
            : tier;
        const { _id: _omit, ...rest } = raw;
        return rest;
    }
    hydrateTierFromDefaults(plain, def) {
        const patch = {};
        let changed = false;
        if (typeof plain.price !== 'number' || Number.isNaN(plain.price)) {
            patch.price = def.price;
            changed = true;
        }
        if (!plain.tagline?.trim()) {
            patch.tagline = def.tagline;
            changed = true;
        }
        if (!plain.period?.trim()) {
            patch.period = def.period;
            changed = true;
        }
        if (!plain.chip?.trim()) {
            patch.chip = def.chip;
            changed = true;
        }
        if (!plain.savings?.trim()) {
            patch.savings = def.savings;
            changed = true;
        }
        if (!plain.description?.trim()) {
            patch.description = def.description;
            changed = true;
        }
        if (!plain.accent?.trim()) {
            patch.accent = def.accent;
            changed = true;
        }
        if (!plain.features?.length) {
            patch.features = def.features;
            changed = true;
        }
        if (plain.promoPrice === undefined && def.promoPrice !== undefined) {
            patch.promoPrice = def.promoPrice;
            changed = true;
        }
        if (plain.showOnLanding === undefined && def.showOnLanding !== undefined) {
            patch.showOnLanding = def.showOnLanding;
            changed = true;
        }
        return { tier: changed ? { ...plain, ...patch } : plain, changed };
    }
    mergeLandingPricingTiers(existing) {
        const defaultsById = new Map(public_defaults_1.DEFAULT_LANDING_PRICING_TIERS.map((t) => [t.id, t]));
        const existingIds = new Set(existing.map((t) => t.id));
        let changed = false;
        const tiers = existing.map((tier) => {
            const plain = this.plainTier(tier);
            const def = defaultsById.get(plain.id);
            if (!def)
                return plain;
            const hydrated = this.hydrateTierFromDefaults(plain, def);
            changed = changed || hydrated.changed;
            return hydrated.tier;
        });
        for (const def of public_defaults_1.DEFAULT_LANDING_PRICING_TIERS) {
            if (!existingIds.has(def.id)) {
                tiers.push({ ...def });
                changed = true;
            }
        }
        return { tiers, changed };
    }
    needsLandingVisibilityMigration(tiers) {
        const byId = new Map(tiers.map((t) => [t.id, t]));
        if (!byId.has('higher'))
            return true;
        if (byId.get('basic')?.showOnLanding || byId.get('smart')?.showOnLanding)
            return true;
        for (const id of public_defaults_1.DEFAULT_LANDING_VISIBLE_IDS) {
            if (!byId.get(id)?.showOnLanding)
                return true;
        }
        return tiers.some((t) => t.showOnLanding === undefined);
    }
    applyDefaultLandingVisibility(tiers) {
        const defaultsById = new Map(public_defaults_1.DEFAULT_LANDING_PRICING_TIERS.map((t) => [t.id, t]));
        return tiers.map((tier) => {
            const plain = this.plainTier(tier);
            const def = defaultsById.get(plain.id);
            if (!def || def.showOnLanding === undefined)
                return plain;
            return { ...plain, showOnLanding: def.showOnLanding };
        });
    }
    async ensureLandingPricing() {
        let doc = await this.landingPricingModel.findOne({ key: 'default' }).exec();
        if (!doc) {
            return this.landingPricingModel.create({
                key: 'default',
                tiers: public_defaults_1.DEFAULT_LANDING_PRICING_TIERS,
                compareRows: public_defaults_1.DEFAULT_PRICING_COMPARE_ROWS,
            });
        }
        let tiers = (doc.tiers?.length ? doc.tiers : public_defaults_1.DEFAULT_LANDING_PRICING_TIERS).map((t) => this.plainTier(t));
        let changed = !doc.tiers?.length;
        const merged = this.mergeLandingPricingTiers(tiers);
        tiers = merged.tiers;
        changed = changed || merged.changed;
        if (this.needsLandingVisibilityMigration(tiers)) {
            tiers = this.applyDefaultLandingVisibility(tiers);
            changed = true;
        }
        const updates = {};
        if (!doc.compareRows?.length)
            updates.compareRows = public_defaults_1.DEFAULT_PRICING_COMPARE_ROWS;
        if (changed)
            updates.tiers = tiers.map((t) => this.plainTier(t));
        if (Object.keys(updates).length) {
            return this.landingPricingModel
                .findOneAndUpdate({ key: 'default' }, { $set: updates }, { new: true })
                .exec();
        }
        return doc;
    }
    async getPricingPlansPayload(opts) {
        const doc = await this.ensureLandingPricing();
        const allTiers = doc.tiers?.length ? doc.tiers : public_defaults_1.DEFAULT_LANDING_PRICING_TIERS;
        const tiers = opts?.landingOnly
            ? allTiers.filter((t) => this.isVisibleOnLanding(t))
            : allTiers;
        const tc = allTiers.length;
        const padCells = (cells) => {
            const out = (cells || []).slice(0, tc);
            while (out.length < tc)
                out.push('—');
            return out;
        };
        const fullCompareRows = doc.compareRows?.length &&
            doc.compareRows.every((r) => Array.isArray(r.cells) && r.cells.length === tc)
            ? doc.compareRows
            : public_defaults_1.DEFAULT_PRICING_COMPARE_ROWS.map((row) => ({
                label: row.label,
                cells: padCells(row.cells),
            }));
        const landingIndices = opts?.landingOnly
            ? allTiers.map((t, i) => (this.isVisibleOnLanding(t) ? i : -1)).filter((i) => i >= 0)
            : null;
        const compareRows = landingIndices
            ? fullCompareRows.map((row) => ({
                label: row.label,
                cells: landingIndices.map((i) => row.cells[i] ?? '—'),
            }))
            : fullCompareRows.map((row) => ({
                label: row.label,
                cells: padCells(row.cells),
            }));
        return { tiers, compareRows };
    }
    validatePricingTiers(tiers) {
        if (!Array.isArray(tiers) || tiers.length < 1 || tiers.length > 12) {
            throw new common_1.BadRequestException('tiers must be a non-empty array (max 12)');
        }
        const seen = new Set();
        for (const t of tiers) {
            if (!t.id?.trim())
                throw new common_1.BadRequestException('Each tier needs id');
            if (seen.has(t.id))
                throw new common_1.BadRequestException(`Duplicate tier id: ${t.id}`);
            seen.add(t.id);
            if (!t.name?.trim())
                throw new common_1.BadRequestException(`Tier ${t.id}: name required`);
            if (typeof t.price !== 'number' || t.price < 0)
                throw new common_1.BadRequestException(`Tier ${t.id}: invalid price`);
            if (!t.period?.trim())
                throw new common_1.BadRequestException(`Tier ${t.id}: period required`);
            if (!Array.isArray(t.features))
                throw new common_1.BadRequestException(`Tier ${t.id}: features must be an array`);
            if (t.features.length < 1) {
                throw new common_1.BadRequestException(`Tier ${t.id}: add at least one plan benefit in features[]`);
            }
            for (let fi = 0; fi < t.features.length; fi++) {
                const line = t.features[fi];
                if (typeof line !== 'string' || !line.trim()) {
                    throw new common_1.BadRequestException(`Tier ${t.id}: features[${fi}] must be a non-empty string`);
                }
            }
            for (const field of ['tagline', 'chip', 'savings', 'description', 'accent']) {
                if (typeof t[field] !== 'string' || !t[field].trim()) {
                    throw new common_1.BadRequestException(`Tier ${t.id}: ${field} is required`);
                }
            }
        }
    }
    validateCompareRows(rows, tierCount) {
        if (!Array.isArray(rows) || rows.length < 1 || rows.length > 40) {
            throw new common_1.BadRequestException('compareRows must be a non-empty array (max 40)');
        }
        let i = 0;
        for (const r of rows) {
            i += 1;
            if (!r.label?.trim())
                throw new common_1.BadRequestException(`compareRows row ${i}: label required`);
            if (!Array.isArray(r.cells) || r.cells.length !== tierCount) {
                throw new common_1.BadRequestException(`compareRows row "${r.label}": expected ${tierCount} cells (one per tier), got ${r.cells?.length ?? 0}`);
            }
        }
    }
    async updateLandingPricing(body) {
        if (!body.tiers?.length && !body.compareRows?.length) {
            throw new common_1.BadRequestException('Provide tiers and/or compareRows to update (at least one non-empty array)');
        }
        const plain = (0, class_transformer_1.instanceToPlain)(body);
        await this.ensureLandingPricing();
        const current = await this.landingPricingModel.findOne({ key: 'default' }).lean().exec();
        const nextTiers = plain.tiers ?? current?.tiers ?? public_defaults_1.DEFAULT_LANDING_PRICING_TIERS;
        const tierCount = Array.isArray(nextTiers) ? nextTiers.length : 0;
        if (!tierCount)
            throw new common_1.BadRequestException('No pricing tiers configured');
        const $set = {};
        if (plain.tiers?.length) {
            this.validatePricingTiers(plain.tiers);
            $set.tiers = plain.tiers;
        }
        if (plain.compareRows?.length) {
            this.validateCompareRows(plain.compareRows, plain.tiers?.length ?? tierCount);
            $set.compareRows = plain.compareRows;
        }
        if (Object.keys($set).length) {
            const doc = await this.landingPricingModel
                .findOneAndUpdate({ key: 'default' }, { $set }, { new: true })
                .exec();
            await this.plansService.syncFromLandingPricing();
            return doc;
        }
        return this.landingPricingModel.findOne({ key: 'default' }).exec();
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(landing_hero_schema_1.LandingHero.name)),
    __param(1, (0, mongoose_1.InjectModel)(landing_pricing_schema_1.LandingPricing.name)),
    __param(2, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(3, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        plans_service_1.PlansService])
], PublicService);
//# sourceMappingURL=public.service.js.map