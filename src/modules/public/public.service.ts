import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { LandingHero, LandingHeroDocument } from './schemas/landing-hero.schema';
import {
  LandingPricing,
  LandingPricingDocument,
  LandingPricingTier,
  LandingPricingCompareRow,
} from './schemas/landing-pricing.schema';
import { Course, CourseDocument } from '../courses/course.schema';
import { Category, CategoryDocument } from '../categories/category.schema';
import { mapCourseToExplorerDto, ExplorerCourseDto } from './course-mapper';
import { PatchLandingPricingDto } from './dto/patch-landing-pricing.dto';
import { PlansService } from '../plans/plans.service';
import {
  DEFAULT_LANDING_HERO,
  DEFAULT_LANDING_PRICING_TIERS,
  DEFAULT_LANDING_VISIBLE_IDS,
  DEFAULT_PRICING_COMPARE_ROWS,
} from './public.defaults';

export {
  DEFAULT_LANDING_HERO,
  DEFAULT_LANDING_PRICING_TIERS,
  DEFAULT_PRICING_COMPARE_ROWS,
} from './public.defaults';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(LandingHero.name) private readonly landingModel: Model<LandingHeroDocument>,
    @InjectModel(LandingPricing.name) private readonly landingPricingModel: Model<LandingPricingDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly config: ConfigService,
    private readonly plansService: PlansService,
  ) {}

  async ensureLandingDoc(): Promise<LandingHeroDocument> {
    let doc = await this.landingModel.findOne({ key: 'default' }).exec();
    if (!doc) {
      doc = await this.landingModel.create({ ...DEFAULT_LANDING_HERO });
    }
    return doc;
  }

  private async categoryNameMap(): Promise<Map<string, string>> {
    const cats = await this.categoryModel.find().lean();
    const m = new Map<string, string>();
    for (const c of cats as any[]) {
      m.set(c._id.toString(), c.name);
    }
    return m;
  }

  async getHeroPayload() {
    const landing = await this.ensureLandingDoc();
    const catMap = await this.categoryNameMap();

    const mediaBase = this.config.get<string>('media.publicBase') || '';

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

    const courses: ExplorerCourseDto[] = (featured as any[]).map((c) =>
      mapCourseToExplorerDto(
        c,
        catMap.get((c.categoryId as Types.ObjectId)?.toString()) || '',
        mediaBase,
      ),
    );

    return {
      slides: landing.slides?.length ? landing.slides : DEFAULT_LANDING_HERO.slides,
      trustPills: landing.trustPills?.length ? landing.trustPills : DEFAULT_LANDING_HERO.trustPills,
      announcementBadge: landing.announcementBadge || DEFAULT_LANDING_HERO.announcementBadge,
      visualMeta: landing.visualMeta?.length ? landing.visualMeta : DEFAULT_LANDING_HERO.visualMeta,
      referralBonusLabel: landing.referralBonusLabel || DEFAULT_LANDING_HERO.referralBonusLabel,
      statCards: landing.statCards?.length ? landing.statCards : DEFAULT_LANDING_HERO.statCards,
      offers: landing.offers?.length ? landing.offers : DEFAULT_LANDING_HERO.offers,
      courses,
    };
  }

  async getCourseBySlug(slug: string): Promise<ExplorerCourseDto> {
    const c = await this.courseModel
      .findOne({ slug: slug.toLowerCase(), isPublished: true })
      .lean()
      .exec();
    if (!c) throw new NotFoundException('Course not found');
    const catMap = await this.categoryNameMap();
    const name = catMap.get((c as any).categoryId?.toString?.()) || '';
    const mediaBase = this.config.get<string>('media.publicBase') || '';
    return mapCourseToExplorerDto(c as any, name, mediaBase);
  }

  /** All published courses for the public catalog (`GET /public/courses`). */
  async listPublishedCoursesExplorer(): Promise<ExplorerCourseDto[]> {
    const list = await this.courseModel
      .find({ isPublished: true })
      .sort({ salesCount: -1, createdAt: -1 })
      .lean()
      .exec();
    const catMap = await this.categoryNameMap();
    const mediaBase = this.config.get<string>('media.publicBase') || '';
    return (list as any[]).map((c) =>
      mapCourseToExplorerDto(c, catMap.get((c.categoryId as Types.ObjectId)?.toString()) || 'General', mediaBase),
    );
  }

  async updateLandingHero(patch: Partial<LandingHero>) {
    const { key, ...rest } = patch as any;
    return this.landingModel
      .findOneAndUpdate({ key: 'default' }, { $set: rest }, { new: true, upsert: true })
      .exec();
  }

  private isVisibleOnLanding(tier: LandingPricingTier): boolean {
    if (tier.showOnLanding === true) return true;
    if (tier.showOnLanding === false) return false;
    return DEFAULT_LANDING_VISIBLE_IDS.includes(tier.id as (typeof DEFAULT_LANDING_VISIBLE_IDS)[number]);
  }

  /** Mongoose subdocuments lose fields when spread; always persist plain tier objects. */
  private plainTier(tier: LandingPricingTier & { toObject?: () => LandingPricingTier }): LandingPricingTier {
    const raw =
      typeof tier.toObject === 'function'
        ? tier.toObject()
        : (tier as LandingPricingTier & { _id?: unknown });
    const { _id: _omit, ...rest } = raw as LandingPricingTier & { _id?: unknown };
    return rest as LandingPricingTier;
  }

  private hydrateTierFromDefaults(
    plain: LandingPricingTier,
    def: LandingPricingTier,
  ): { tier: LandingPricingTier; changed: boolean } {
    const patch: Partial<LandingPricingTier> = {};
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

  private mergeLandingPricingTiers(existing: LandingPricingTier[]): {
    tiers: LandingPricingTier[];
    changed: boolean;
  } {
    const defaultsById = new Map(DEFAULT_LANDING_PRICING_TIERS.map((t) => [t.id, t]));
    const existingIds = new Set(existing.map((t) => t.id));
    let changed = false;

    const tiers = existing.map((tier) => {
      const plain = this.plainTier(tier);
      const def = defaultsById.get(plain.id);
      if (!def) return plain;

      const hydrated = this.hydrateTierFromDefaults(plain, def);
      changed = changed || hydrated.changed;
      return hydrated.tier;
    });

    for (const def of DEFAULT_LANDING_PRICING_TIERS) {
      if (!existingIds.has(def.id)) {
        tiers.push({ ...def });
        changed = true;
      }
    }

    return { tiers, changed };
  }

  /** One-time style migration when DB still has the old basic/smart/elite landing layout. */
  private needsLandingVisibilityMigration(tiers: LandingPricingTier[]): boolean {
    const byId = new Map(tiers.map((t) => [t.id, t]));
    if (!byId.has('higher')) return true;
    if (byId.get('basic')?.showOnLanding || byId.get('smart')?.showOnLanding) return true;
    for (const id of DEFAULT_LANDING_VISIBLE_IDS) {
      if (!byId.get(id)?.showOnLanding) return true;
    }
    return tiers.some((t) => t.showOnLanding === undefined);
  }

  private applyDefaultLandingVisibility(tiers: LandingPricingTier[]): LandingPricingTier[] {
    const defaultsById = new Map(DEFAULT_LANDING_PRICING_TIERS.map((t) => [t.id, t]));
    return tiers.map((tier) => {
      const plain = this.plainTier(tier);
      const def = defaultsById.get(plain.id);
      if (!def || def.showOnLanding === undefined) return plain;
      return { ...plain, showOnLanding: def.showOnLanding };
    });
  }

  async ensureLandingPricing(): Promise<LandingPricingDocument> {
    let doc = await this.landingPricingModel.findOne({ key: 'default' }).exec();
    if (!doc) {
      return this.landingPricingModel.create({
        key: 'default',
        tiers: DEFAULT_LANDING_PRICING_TIERS,
        compareRows: DEFAULT_PRICING_COMPARE_ROWS,
      });
    }

    let tiers = (doc.tiers?.length ? doc.tiers : DEFAULT_LANDING_PRICING_TIERS).map((t) =>
      this.plainTier(t),
    );
    let changed = !doc.tiers?.length;

    const merged = this.mergeLandingPricingTiers(tiers);
    tiers = merged.tiers;
    changed = changed || merged.changed;

    if (this.needsLandingVisibilityMigration(tiers)) {
      tiers = this.applyDefaultLandingVisibility(tiers);
      changed = true;
    }

    const updates: Record<string, unknown> = {};
    if (!doc.compareRows?.length) updates.compareRows = DEFAULT_PRICING_COMPARE_ROWS;
    if (changed) updates.tiers = tiers.map((t) => this.plainTier(t));

    if (Object.keys(updates).length) {
      return this.landingPricingModel
        .findOneAndUpdate({ key: 'default' }, { $set: updates }, { new: true })
        .exec() as Promise<LandingPricingDocument>;
    }
    return doc;
  }

  async getPricingPlansPayload(opts?: { landingOnly?: boolean }) {
    const doc = await this.ensureLandingPricing();
    const allTiers = doc.tiers?.length ? doc.tiers : DEFAULT_LANDING_PRICING_TIERS;
    const tiers = opts?.landingOnly
      ? allTiers.filter((t) => this.isVisibleOnLanding(t))
      : allTiers;
    const tc = allTiers.length;
    const padCells = (cells: string[]) => {
      const out = (cells || []).slice(0, tc);
      while (out.length < tc) out.push('—');
      return out;
    };
    const fullCompareRows =
      doc.compareRows?.length &&
      doc.compareRows.every((r) => Array.isArray(r.cells) && r.cells.length === tc)
        ? doc.compareRows
        : DEFAULT_PRICING_COMPARE_ROWS.map((row) => ({
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

  private validatePricingTiers(tiers: LandingPricingTier[]) {
    if (!Array.isArray(tiers) || tiers.length < 1 || tiers.length > 12) {
      throw new BadRequestException('tiers must be a non-empty array (max 12)');
    }
    const seen = new Set<string>();
    for (const t of tiers) {
      if (!t.id?.trim()) throw new BadRequestException('Each tier needs id');
      if (seen.has(t.id)) throw new BadRequestException(`Duplicate tier id: ${t.id}`);
      seen.add(t.id);
      if (!t.name?.trim()) throw new BadRequestException(`Tier ${t.id}: name required`);
      if (typeof t.price !== 'number' || t.price < 0) throw new BadRequestException(`Tier ${t.id}: invalid price`);
      if (!t.period?.trim()) throw new BadRequestException(`Tier ${t.id}: period required`);
      if (!Array.isArray(t.features)) throw new BadRequestException(`Tier ${t.id}: features must be an array`);
      if (t.features.length < 1) {
        throw new BadRequestException(`Tier ${t.id}: add at least one plan benefit in features[]`);
      }
      for (let fi = 0; fi < t.features.length; fi++) {
        const line = t.features[fi];
        if (typeof line !== 'string' || !line.trim()) {
          throw new BadRequestException(`Tier ${t.id}: features[${fi}] must be a non-empty string`);
        }
      }
      for (const field of ['tagline', 'chip', 'savings', 'description', 'accent'] as const) {
        if (typeof t[field] !== 'string' || !(t[field] as string).trim()) {
          throw new BadRequestException(`Tier ${t.id}: ${field} is required`);
        }
      }
    }
  }

  private validateCompareRows(rows: LandingPricingCompareRow[], tierCount: number) {
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 40) {
      throw new BadRequestException('compareRows must be a non-empty array (max 40)');
    }
    let i = 0;
    for (const r of rows) {
      i += 1;
      if (!r.label?.trim()) throw new BadRequestException(`compareRows row ${i}: label required`);
      if (!Array.isArray(r.cells) || r.cells.length !== tierCount) {
        throw new BadRequestException(
          `compareRows row "${r.label}": expected ${tierCount} cells (one per tier), got ${r.cells?.length ?? 0}`,
        );
      }
    }
  }

  async updateLandingPricing(body: PatchLandingPricingDto) {
    if (!body.tiers?.length && !body.compareRows?.length) {
      throw new BadRequestException('Provide tiers and/or compareRows to update (at least one non-empty array)');
    }

    const plain = instanceToPlain(body) as {
      tiers?: LandingPricingTier[];
      compareRows?: LandingPricingCompareRow[];
    };

    await this.ensureLandingPricing();
    const current = await this.landingPricingModel.findOne({ key: 'default' }).lean().exec();
    const nextTiers = plain.tiers ?? (current as any)?.tiers ?? DEFAULT_LANDING_PRICING_TIERS;
    const tierCount = Array.isArray(nextTiers) ? nextTiers.length : 0;
    if (!tierCount) throw new BadRequestException('No pricing tiers configured');

    const $set: Record<string, unknown> = {};
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
}
