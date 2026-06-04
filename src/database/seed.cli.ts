/**
 * Run: npm run seed
 * Creates default admin, categories, hero landing document, featured courses, platform settings,
 * and landing pricing tiers (always synced on each seed run).
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../modules/users/user.schema';
import { UserRole } from '../common/constants/app.constants';
import { Category, CategoryDocument } from '../modules/categories/category.schema';
import { Course, CourseDocument } from '../modules/courses/course.schema';
import { PlatformSettings, PlatformSettingsDocument } from '../modules/settings/schemas/platform-settings.schema';
import { LandingHero, LandingHeroDocument } from '../modules/public/schemas/landing-hero.schema';
import { LandingPricing, LandingPricingDocument } from '../modules/public/schemas/landing-pricing.schema';
import { DEFAULT_LANDING_HERO, DEFAULT_LANDING_PRICING_TIERS } from '../modules/public/public.defaults';
import { Plan, PlanDocument } from '../modules/plans/plan.schema';
import { Wallet, WalletDocument } from '../modules/wallet/schemas/wallet.schema';
import { PromoCoupon, PromoCouponDocument } from '../modules/coupons/promo-coupon.schema';
import { PlansService } from '../modules/plans/plans.service';

const DEMO_PASSWORD = 'Demo123!';

type DummyUserDef = {
  name: string;
  email: string;
  referralCode: string;
  planName?: 'Starter' | 'Pro' | 'Elite';
  referredByEmail?: string;
  role?: UserRole;
};

/** Explorer / affiliate demo accounts — same password for all: Demo123! */
const DUMMY_USERS: DummyUserDef[] = [
  {
    name: 'Alex Demo Seller',
    email: 'alex@demo.local',
    referralCode: 'ALEXDEMO01',
    planName: 'Pro',
  },
  {
    name: 'Priya Demo Member',
    email: 'priya@demo.local',
    referralCode: 'PRIYADEMO2',
    planName: 'Starter',
    referredByEmail: 'alex@demo.local',
  },
  {
    name: 'Rohan Demo Member',
    email: 'rohan@demo.local',
    referralCode: 'ROHANDEMO3',
    planName: 'Pro',
    referredByEmail: 'alex@demo.local',
  },
  {
    name: 'Maya Demo User',
    email: 'maya@demo.local',
    referralCode: 'MAYADEMO04',
  },
  {
    name: 'Explorer Test User',
    email: 'user@edupath.local',
    referralCode: 'EDUPATH01',
    planName: 'Starter',
  },
];

const cover = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const categoryModel = app.get<Model<CategoryDocument>>(getModelToken(Category.name));
  const courseModel = app.get<Model<CourseDocument>>(getModelToken(Course.name));
  const settingsModel = app.get<Model<PlatformSettingsDocument>>(getModelToken(PlatformSettings.name));
  const landingModel = app.get<Model<LandingHeroDocument>>(getModelToken(LandingHero.name));
  const landingPricingModel = app.get<Model<LandingPricingDocument>>(getModelToken(LandingPricing.name));
  const planModel = app.get<Model<PlanDocument>>(getModelToken(Plan.name));
  const walletModel = app.get<Model<WalletDocument>>(getModelToken(Wallet.name));
  const promoCouponModel = app.get<Model<PromoCouponDocument>>(getModelToken(PromoCoupon.name));

  await settingsModel.updateOne(
    { key: 'global' },
    {
      $set: { memberPromoBuyerDiscountPercent: 40 },
      $setOnInsert: { key: 'global' },
    },
    { upsert: true },
  );

  await landingModel.updateOne(
    { key: 'default' },
    { $setOnInsert: { key: 'default', ...DEFAULT_LANDING_HERO } },
    { upsert: true },
  );

  await landingPricingModel.updateOne(
    { key: 'default' },
    {
      $set: { tiers: DEFAULT_LANDING_PRICING_TIERS },
      $setOnInsert: { key: 'default' },
    },
    { upsert: true },
  );

  const planDefs = [
    { name: 'Starter', price: 999, features: ['Core courses', 'Community access'] },
    { name: 'Pro', price: 2999, features: ['All courses', 'Affiliate tools', 'Priority support'] },
    { name: 'Elite', price: 9999, features: ['Everything in Pro', '1:1 mentorship', 'Highest commissions'] },
  ];
  const planByName: Record<string, PlanDocument> = {};
  for (const p of planDefs) {
    let doc = await planModel.findOne({ name: p.name });
    if (!doc) doc = await planModel.create(p);
    planByName[p.name] = doc;
  }

  const couponDefs = [
    { code: 'SAVE10', discountType: 'percentage' as const, discountValue: 10, minPurchase: 0 },
    { code: 'FLAT200', discountType: 'fixed' as const, discountValue: 200, minPurchase: 500 },
  ];
  for (const c of couponDefs) {
    const exists = await promoCouponModel.findOne({ code: c.code });
    if (!exists) {
      await promoCouponModel.create({ ...c, active: true, maxUsage: 0, usedCount: 0 });
      console.log('Seeded promo coupon', c.code);
    }
  }

  const adminEmail = 'admin@edupath.local';
  let admin = await userModel.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash('Admin123!', 10);
    admin = await userModel.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: hash,
      referralCode: 'ADMINSEED1',
      role: UserRole.ADMIN,
      emailVerified: true,
    });
    // eslint-disable-next-line no-console
    console.log('Created admin:', adminEmail, '/ Admin123!');
  }

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userByEmail: Record<string, UserDocument> = { [adminEmail]: admin };

  for (const def of DUMMY_USERS) {
    const email = def.email.toLowerCase();
    let doc = await userModel.findOne({ email });
    const planId = def.planName ? planByName[def.planName]?._id ?? null : null;
    const referredBy = def.referredByEmail
      ? userByEmail[def.referredByEmail.toLowerCase()]?._id ?? null
      : null;

    if (!doc) {
      doc = await userModel.create({
        name: def.name,
        email,
        password: demoHash,
        referralCode: def.referralCode.toUpperCase(),
        role: def.role ?? UserRole.USER,
        emailVerified: true,
        accountActive: true,
        planId,
        referredBy,
      });
      if (referredBy) {
        await userModel.findByIdAndUpdate(referredBy, {
          $inc: { totalReferralsCount: 1, directReferralsCount: 1 },
        });
      }
      console.log('Created demo user:', email);
    } else {
      await userModel.updateOne(
        { _id: doc._id },
        {
          $set: {
            name: def.name,
            password: demoHash,
            referralCode: def.referralCode.toUpperCase(),
            emailVerified: true,
            accountActive: true,
            planId,
            referredBy,
          },
        },
      );
      doc = (await userModel.findById(doc._id))!;
      console.log('Updated demo user:', email);
    }

    const walletExists = await walletModel.exists({ userId: doc._id });
    if (!walletExists) {
      await walletModel.create({ userId: doc._id, availableBalance: 0, pendingBalance: 0, currency: 'INR' });
    }

    userByEmail[email] = doc;
  }

  const categoryDefs = [
    { name: 'Web Development', slug: 'web-development', order: 1 },
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence', order: 2 },
    { name: 'Design', slug: 'design', order: 3 },
    { name: 'Data', slug: 'data', order: 4 },
    { name: 'Cloud', slug: 'cloud', order: 5 },
    { name: 'Mobile', slug: 'mobile', order: 6 },
  ];
  const catBySlug: Record<string, any> = {};
  for (const c of categoryDefs) {
    let doc = await categoryModel.findOne({ slug: c.slug });
    if (!doc) doc = await categoryModel.create(c);
    catBySlug[c.slug] = doc;
  }

  const sampleModules = (hours: number) => [
    {
      title: 'Module 1',
      order: 0,
      lessons: [
        { title: 'Welcome & overview', durationSec: hours * 180, freePreview: true, order: 0 },
        { title: 'Core concepts', durationSec: hours * 600, order: 1 },
        { title: 'Hands-on project', durationSec: hours * 720, order: 2 },
      ],
    },
  ];

  const seedCourses: Partial<Course>[] = [
    {
      slug: 'react-mastery',
      title: 'React Mastery — From Zero to Production',
      shortDescription: 'Master modern React with hooks, performance, and real-world architecture.',
      price: 2499,
      discountPrice: 0,
      categoryId: catBySlug['web-development']._id,
      instructorName: 'Aarav Sharma',
      level: 'Intermediate',
      ratingAvg: 4.9,
      ratingCount: 120,
      salesCount: 12480,
      thumbnailUrl: cover('1633356122544-f134324a6cee'),
      featuredOnHero: true,
      heroOrder: 1,
      modules: sampleModules(32),
    },
    {
      slug: 'ai-engineering',
      title: 'AI Engineering Bootcamp',
      shortDescription: 'RAG, fine-tuning, agents — ship production AI features.',
      price: 4999,
      discountPrice: 0,
      categoryId: catBySlug['artificial-intelligence']._id,
      instructorName: 'Dr. Meera Iyer',
      level: 'Advanced',
      ratingAvg: 4.8,
      ratingCount: 90,
      salesCount: 8230,
      thumbnailUrl: cover('1677442136019-21780ecad995'),
      featuredOnHero: true,
      heroOrder: 2,
      modules: sampleModules(44),
    },
    {
      slug: 'ui-design',
      title: 'Modern UI/UX Design Systems',
      shortDescription: 'Design tokens, components, motion, accessibility.',
      price: 1799,
      discountPrice: 0,
      categoryId: catBySlug['design']._id,
      instructorName: 'Kavya Reddy',
      level: 'Beginner',
      ratingAvg: 4.9,
      ratingCount: 200,
      salesCount: 6105,
      thumbnailUrl: cover('1561070791-2526d30994b8'),
      featuredOnHero: true,
      heroOrder: 3,
      modules: sampleModules(21),
    },
    {
      slug: 'data-science',
      title: 'Data Science with Python',
      shortDescription: 'Pandas, NumPy, ML, real datasets, end-to-end projects.',
      price: 2999,
      discountPrice: 0,
      categoryId: catBySlug['data']._id,
      instructorName: 'Rohan Mehta',
      level: 'Intermediate',
      ratingAvg: 4.7,
      ratingCount: 150,
      salesCount: 9842,
      thumbnailUrl: cover('1551288049-bebda4e38f71'),
      featuredOnHero: true,
      heroOrder: 4,
      modules: sampleModules(38),
    },
    {
      slug: 'devops',
      title: 'DevOps & Cloud Engineering',
      shortDescription: 'Docker, K8s, CI/CD, AWS — modern delivery practices.',
      price: 3499,
      discountPrice: 0,
      categoryId: catBySlug['cloud']._id,
      instructorName: 'Priya Nair',
      level: 'Advanced',
      ratingAvg: 4.8,
      ratingCount: 80,
      salesCount: 5421,
      thumbnailUrl: cover('1518770660439-4636190af475'),
      featuredOnHero: true,
      heroOrder: 5,
      modules: sampleModules(29),
    },
    {
      slug: 'mobile',
      title: 'Cross-Platform Mobile with React Native',
      shortDescription: 'Build and ship iOS + Android apps from one codebase.',
      price: 2299,
      discountPrice: 0,
      categoryId: catBySlug['mobile']._id,
      instructorName: 'Ishaan Verma',
      level: 'Intermediate',
      ratingAvg: 4.6,
      ratingCount: 70,
      salesCount: 4310,
      thumbnailUrl: cover('1512941937669-90a1b58e7e9c'),
      featuredOnHero: true,
      heroOrder: 6,
      modules: sampleModules(26),
    },
  ];

  for (const sc of seedCourses) {
    const exists = await courseModel.findOne({ slug: sc.slug });
    if (!exists) {
      await courseModel.create({
        ...sc,
        uploadedBy: admin._id,
        isPublished: true,
        language: 'en',
        videos: [],
        images: [],
      });
      // eslint-disable-next-line no-console
      console.log('Seeded course', sc.slug);
    }
  }

  const publishedCourses = await courseModel.find({ isPublished: true }).select('_id slug level').lean();
  const bySlug = Object.fromEntries(publishedCourses.map((c) => [c.slug, c._id.toString()]));
  const allCourseIdStrings = publishedCourses.map((c) => c._id.toString());
  /** Starter = small bundle only (not full library). */
  const starterCourseIds = ['ui-design', 'mobile']
    .map((s) => bySlug[s])
    .filter(Boolean);
  /** Pro / Elite = full seeded catalog. */
  const proCourseIds = allCourseIdStrings;

  const pricingDoc = await landingPricingModel.findOne({ key: 'default' }).lean();
  const baseTiers = pricingDoc?.tiers?.length ? pricingDoc.tiers : DEFAULT_LANDING_PRICING_TIERS;
  const tiersWithCourses = baseTiers.map((t: { id: string }) => ({
    ...t,
    courseIds:
      t.id === 'starter'
        ? starterCourseIds.length
          ? starterCourseIds
          : allCourseIdStrings.slice(0, 2)
        : proCourseIds,
  }));
  await landingPricingModel.updateOne(
    { key: 'default' },
    { $set: { tiers: tiersWithCourses } },
    { upsert: true },
  );

  const plansService = app.get(PlansService);
  await plansService.syncFromLandingPricing();

  const tierStarter = await planModel.findOne({ tierId: 'starter' });
  const tierPro = await planModel.findOne({ tierId: 'pro' });
  for (const def of DUMMY_USERS) {
    if (!def.planName) continue;
    const tierPlan =
      def.planName === 'Starter' ? tierStarter : def.planName === 'Pro' ? tierPro : null;
    if (tierPlan) {
      await userModel.updateOne(
        { email: def.email.toLowerCase() },
        { $set: { planId: tierPlan._id, accountActive: true } },
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log('\n========== SEED CREDENTIALS ==========\n');

  // eslint-disable-next-line no-console
  console.log('--- Admin (admin panel: http://localhost:5174) ---');
  // eslint-disable-next-line no-console
  console.log('Email:    ', adminEmail);
  // eslint-disable-next-line no-console
  console.log('Password: ', 'Admin123!');
  // eslint-disable-next-line no-console
  console.log('Promo:    ', 'ADMINSEED1 (admin referral code)\n');

  // eslint-disable-next-line no-console
  console.log('--- Demo users (explorer: http://localhost:5173) — password for all: ' + DEMO_PASSWORD + ' ---');
  for (const def of DUMMY_USERS) {
    const planNote = def.planName ? `plan: ${def.planName}` : 'no plan (promo not valid at checkout)';
    const refNote = def.referredByEmail ? `referred by ${def.referredByEmail}` : 'no upline';
    // eslint-disable-next-line no-console
    console.log(`\n${def.name}`);
    // eslint-disable-next-line no-console
    console.log('  Email:    ', def.email);
    // eslint-disable-next-line no-console
    console.log('  Password: ', DEMO_PASSWORD);
    // eslint-disable-next-line no-console
    console.log('  Promo:    ', def.referralCode, `(${planNote}, ${refNote})`);
  }

  // eslint-disable-next-line no-console
  console.log('\n--- Quick copy (login | promo) ---');
  for (const def of DUMMY_USERS) {
    // eslint-disable-next-line no-console
    console.log(`${def.email} | ${DEMO_PASSWORD} | ${def.referralCode}`);
  }

  // eslint-disable-next-line no-console
  console.log('\n--- Discount coupons (buyer price off at Sell Plan) ---');
  console.log('SAVE10  — 10% off any plan');
  console.log('FLAT200 — ₹200 off when plan price ≥ ₹500');
  console.log('\nMember codes (ALEXDEMO01, etc.) = commission only, no buyer discount.');
  console.log(
    '\nNote: Promo codes with a plan work at checkout. Maya has no plan — login only.\n' +
      'If admin existed before seed, Admin password was NOT reset.\n',
  );

  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
