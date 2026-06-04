"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../modules/users/user.schema");
const app_constants_1 = require("../common/constants/app.constants");
const category_schema_1 = require("../modules/categories/category.schema");
const course_schema_1 = require("../modules/courses/course.schema");
const platform_settings_schema_1 = require("../modules/settings/schemas/platform-settings.schema");
const landing_hero_schema_1 = require("../modules/public/schemas/landing-hero.schema");
const landing_pricing_schema_1 = require("../modules/public/schemas/landing-pricing.schema");
const public_defaults_1 = require("../modules/public/public.defaults");
const plan_schema_1 = require("../modules/plans/plan.schema");
const wallet_schema_1 = require("../modules/wallet/schemas/wallet.schema");
const promo_coupon_schema_1 = require("../modules/coupons/promo-coupon.schema");
const plans_service_1 = require("../modules/plans/plans.service");
const DEMO_PASSWORD = 'Demo123!';
const DUMMY_USERS = [
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
const cover = (seed) => `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const categoryModel = app.get((0, mongoose_1.getModelToken)(category_schema_1.Category.name));
    const courseModel = app.get((0, mongoose_1.getModelToken)(course_schema_1.Course.name));
    const settingsModel = app.get((0, mongoose_1.getModelToken)(platform_settings_schema_1.PlatformSettings.name));
    const landingModel = app.get((0, mongoose_1.getModelToken)(landing_hero_schema_1.LandingHero.name));
    const landingPricingModel = app.get((0, mongoose_1.getModelToken)(landing_pricing_schema_1.LandingPricing.name));
    const planModel = app.get((0, mongoose_1.getModelToken)(plan_schema_1.Plan.name));
    const walletModel = app.get((0, mongoose_1.getModelToken)(wallet_schema_1.Wallet.name));
    const promoCouponModel = app.get((0, mongoose_1.getModelToken)(promo_coupon_schema_1.PromoCoupon.name));
    await settingsModel.updateOne({ key: 'global' }, {
        $set: { memberPromoBuyerDiscountPercent: 40 },
        $setOnInsert: { key: 'global' },
    }, { upsert: true });
    await landingModel.updateOne({ key: 'default' }, { $setOnInsert: { key: 'default', ...public_defaults_1.DEFAULT_LANDING_HERO } }, { upsert: true });
    await landingPricingModel.updateOne({ key: 'default' }, {
        $set: { tiers: public_defaults_1.DEFAULT_LANDING_PRICING_TIERS },
        $setOnInsert: { key: 'default' },
    }, { upsert: true });
    const planDefs = [
        { name: 'Starter', price: 999, features: ['Core courses', 'Community access'] },
        { name: 'Pro', price: 2999, features: ['All courses', 'Affiliate tools', 'Priority support'] },
        { name: 'Elite', price: 9999, features: ['Everything in Pro', '1:1 mentorship', 'Highest commissions'] },
    ];
    const planByName = {};
    for (const p of planDefs) {
        let doc = await planModel.findOne({ name: p.name });
        if (!doc)
            doc = await planModel.create(p);
        planByName[p.name] = doc;
    }
    const couponDefs = [
        { code: 'SAVE10', discountType: 'percentage', discountValue: 10, minPurchase: 0 },
        { code: 'FLAT200', discountType: 'fixed', discountValue: 200, minPurchase: 500 },
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
            role: app_constants_1.UserRole.ADMIN,
            emailVerified: true,
        });
        console.log('Created admin:', adminEmail, '/ Admin123!');
    }
    const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const userByEmail = { [adminEmail]: admin };
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
                role: def.role ?? app_constants_1.UserRole.USER,
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
        }
        else {
            await userModel.updateOne({ _id: doc._id }, {
                $set: {
                    name: def.name,
                    password: demoHash,
                    referralCode: def.referralCode.toUpperCase(),
                    emailVerified: true,
                    accountActive: true,
                    planId,
                    referredBy,
                },
            });
            doc = (await userModel.findById(doc._id));
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
    const catBySlug = {};
    for (const c of categoryDefs) {
        let doc = await categoryModel.findOne({ slug: c.slug });
        if (!doc)
            doc = await categoryModel.create(c);
        catBySlug[c.slug] = doc;
    }
    const sampleModules = (hours) => [
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
    const seedCourses = [
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
            console.log('Seeded course', sc.slug);
        }
    }
    const publishedCourses = await courseModel.find({ isPublished: true }).select('_id slug level').lean();
    const bySlug = Object.fromEntries(publishedCourses.map((c) => [c.slug, c._id.toString()]));
    const allCourseIdStrings = publishedCourses.map((c) => c._id.toString());
    const starterCourseIds = ['ui-design', 'mobile']
        .map((s) => bySlug[s])
        .filter(Boolean);
    const proCourseIds = allCourseIdStrings;
    const pricingDoc = await landingPricingModel.findOne({ key: 'default' }).lean();
    const baseTiers = pricingDoc?.tiers?.length ? pricingDoc.tiers : public_defaults_1.DEFAULT_LANDING_PRICING_TIERS;
    const tiersWithCourses = baseTiers.map((t) => ({
        ...t,
        courseIds: t.id === 'starter'
            ? starterCourseIds.length
                ? starterCourseIds
                : allCourseIdStrings.slice(0, 2)
            : proCourseIds,
    }));
    await landingPricingModel.updateOne({ key: 'default' }, { $set: { tiers: tiersWithCourses } }, { upsert: true });
    const plansService = app.get(plans_service_1.PlansService);
    await plansService.syncFromLandingPricing();
    const tierStarter = await planModel.findOne({ tierId: 'starter' });
    const tierPro = await planModel.findOne({ tierId: 'pro' });
    for (const def of DUMMY_USERS) {
        if (!def.planName)
            continue;
        const tierPlan = def.planName === 'Starter' ? tierStarter : def.planName === 'Pro' ? tierPro : null;
        if (tierPlan) {
            await userModel.updateOne({ email: def.email.toLowerCase() }, { $set: { planId: tierPlan._id, accountActive: true } });
        }
    }
    console.log('\n========== SEED CREDENTIALS ==========\n');
    console.log('--- Admin (admin panel: http://localhost:5174) ---');
    console.log('Email:    ', adminEmail);
    console.log('Password: ', 'Admin123!');
    console.log('Promo:    ', 'ADMINSEED1 (admin referral code)\n');
    console.log('--- Demo users (explorer: http://localhost:5173) — password for all: ' + DEMO_PASSWORD + ' ---');
    for (const def of DUMMY_USERS) {
        const planNote = def.planName ? `plan: ${def.planName}` : 'no plan (promo not valid at checkout)';
        const refNote = def.referredByEmail ? `referred by ${def.referredByEmail}` : 'no upline';
        console.log(`\n${def.name}`);
        console.log('  Email:    ', def.email);
        console.log('  Password: ', DEMO_PASSWORD);
        console.log('  Promo:    ', def.referralCode, `(${planNote}, ${refNote})`);
    }
    console.log('\n--- Quick copy (login | promo) ---');
    for (const def of DUMMY_USERS) {
        console.log(`${def.email} | ${DEMO_PASSWORD} | ${def.referralCode}`);
    }
    console.log('\n--- Discount coupons (buyer price off at Sell Plan) ---');
    console.log('SAVE10  — 10% off any plan');
    console.log('FLAT200 — ₹200 off when plan price ≥ ₹500');
    console.log('\nMember codes (ALEXDEMO01, etc.) = commission only, no buyer discount.');
    console.log('\nNote: Promo codes with a plan work at checkout. Maya has no plan — login only.\n' +
        'If admin existed before seed, Admin password was NOT reset.\n');
    await app.close();
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.cli.js.map