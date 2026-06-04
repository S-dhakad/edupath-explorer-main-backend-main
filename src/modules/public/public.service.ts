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

  async ensureLandingPricing(): Promise<LandingPricingDocument> {
    let doc = await this.landingPricingModel.findOne({ key: 'default' }).exec();
    if (!doc) {
      return this.landingPricingModel.create({
        key: 'default',
        tiers: DEFAULT_LANDING_PRICING_TIERS,
        compareRows: DEFAULT_PRICING_COMPARE_ROWS,
      });
    }
    const updates: Record<string, unknown> = {};
    if (!doc.tiers?.length) updates.tiers = DEFAULT_LANDING_PRICING_TIERS;
    if (!doc.compareRows?.length) updates.compareRows = DEFAULT_PRICING_COMPARE_ROWS;
    if (Object.keys(updates).length) {
      return this.landingPricingModel
        .findOneAndUpdate({ key: 'default' }, { $set: updates }, { new: true })
        .exec() as Promise<LandingPricingDocument>;
    }
    return doc;
  }

  async getPricingPlansPayload() {
    const doc = await this.ensureLandingPricing();
    const tiers = doc.tiers?.length ? doc.tiers : DEFAULT_LANDING_PRICING_TIERS;
    const tc = tiers.length;
    const padCells = (cells: string[]) => {
      const out = (cells || []).slice(0, tc);
      while (out.length < tc) out.push('—');
      return out;
    };
    const compareRows =
      doc.compareRows?.length &&
      doc.compareRows.every((r) => Array.isArray(r.cells) && r.cells.length === tc)
        ? doc.compareRows
        : DEFAULT_PRICING_COMPARE_ROWS.map((row) => ({
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
