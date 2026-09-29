import { LandingHero } from './schemas/landing-hero.schema';
import {
  LandingPricingCompareRow,
  LandingPricingTier,
} from './schemas/landing-pricing.schema';

export const DEFAULT_LANDING_HERO: Partial<LandingHero> = {
  key: 'default',
  slides: [
    {
      eyebrow: 'Career transformation',
      title: 'Learn skills that',
      highlight: 'change careers',
      suffix: '.',
      description:
        'Hand-crafted courses by industry experts. Live mentorship, real projects, and a referral program where everyone wins.',
      imageUrl: '',
      videoUrl: '',
    },
    {
      eyebrow: 'Industry-ready learning',
      title: 'Master tech that',
      highlight: 'builds futures',
      suffix: '.',
      description:
        'Join 50,000+ students who transformed their careers with personalized guidance from top mentors.',
      imageUrl: '',
      videoUrl: '',
    },
    {
      eyebrow: 'Outcomes that matter',
      title: 'Start your',
      highlight: 'dream job',
      suffix: ' today.',
      description:
        '89% placement rate. Average 3x salary increase. Learn what companies actually want from day one.',
      imageUrl: '',
      videoUrl: '',
    },
  ],
  trustPills: ['50K+ learners', 'Live mentorship', 'Referral rewards'],
  announcementBadge: 'New cohorts every Monday',
  visualMeta: [
    {
      chip: 'Placement ready',
      metricLabel: 'Completion rate',
      metricValue: '92%',
      metricHint: 'Portfolio-ready finish',
    },
    {
      chip: 'Live cohort',
      metricLabel: 'Avg salary lift',
      metricValue: '3x',
      metricHint: 'After career switch',
    },
    {
      chip: 'New batch',
      metricLabel: 'Hiring partners',
      metricValue: '250+',
      metricHint: 'Active hiring network',
    },
  ],
  referralBonusLabel: '₹500 / referral',
  statCards: [
    { key: 'learners', value: 50, suffix: 'K+', label: 'Learners' },
    { key: 'courses', value: 200, suffix: '+', label: 'Courses' },
    { key: 'satisfaction', value: 98, suffix: '%', label: 'Satisfaction' },
  ],
  offers: [
    {
      id: 'o1',
      title: 'Flat 40% off on Pro Learner',
      subtitle: 'Festive season special — limited to 48 hours',
      cta: 'Claim Offer',
      tone: 'primary',
    },
    {
      id: 'o2',
      title: 'Refer & Earn ₹500 per friend',
      subtitle: 'Your friends get 20% off, you get instant credit',
      cta: 'Get Referral Link',
      tone: 'accent',
    },
    {
      id: 'o3',
      title: 'AI Engineering Bootcamp — New Batch',
      subtitle: 'Cohort starts Monday with live mentorship',
      cta: 'Enroll Now',
      tone: 'dark',
    },
  ],
};

/** Plans shown on homepage pricing section (admin can override per tier). */
export const DEFAULT_LANDING_VISIBLE_IDS = ['elite', 'premium', 'higher'] as const;

/** Homepage pricing tiers — matches explorer `plans` + cover copy */
export const DEFAULT_LANDING_PRICING_TIERS: LandingPricingTier[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    tagline: 'Start your journey',
    price: 799,
    promoPrice: 499,
    period: 'one-time',
    features: [
      'Social media mastery',
      'Social media automation',
      'Sales marketing',
      'Marketing mindset',
      'Whatsapp automation',
      'English grammar Mastery',
    ],
    highlight: false,
    showOnLanding: false,
    chip: 'Starter level',
    savings: 'Active income ₹349 | Passive ₹49',
    description:
      'Begin your digital journey with social media, sales marketing, and automation fundamentals.',
    accent: 'from-primary/70 via-primary/40 to-transparent',
    courseIds: [],
  },
  {
    id: 'smart',
    name: 'Smart Package',
    tagline: 'Start your journey',
    price: 1500,
    promoPrice: 999,
    period: 'one-time',
    features: [
      'Everything in basic plan',
      'YouTube domination',
      'Basic graphic design',
      'Basic video editing',
      'YouTube Short mastery',
      'Public speaking',
    ],
    highlight: false,
    showOnLanding: false,
    badge: 'Most Popular',
    chip: 'Best seller',
    savings: 'Active income ₹699 | Passive ₹89',
    description:
      'Level up with YouTube growth, content creation, and public speaking on top of all basic skills.',
    accent: 'from-white/35 via-white/10 to-transparent',
    courseIds: [],
  },
  {
    id: 'elite',
    name: 'Elite Package',
    tagline: 'Start your journey',
    price: 2500,
    promoPrice: 1999,
    period: 'one-time',
    features: [
      'Everything in smart package',
      'Performance marketing',
      'Ai tools',
      'Advanced graphic designing',
      'Advanced video editing',
      'Advanced Excel mastery',
      'Contact Marketing',
    ],
    badge: 'Best Value',
    showOnLanding: true,
    highlight: false,
    chip: 'Advanced skills',
    savings: 'Active income ₹1399 | Passive ₹199',
    description:
      'Master advanced tools — AI, performance marketing, video & design — for a full digital career.',
    accent: 'from-accent/80 via-accent/35 to-transparent',
    courseIds: [],
  },
  {
    id: 'premium',
    name: 'Premium Package',
    tagline: 'Start your journey',
    price: 9999,
    promoPrice: 7999,
    period: 'one-time',
    features: [
      'Everything in elite package',
      'E-mail marketing',
      'E-commerce',
      'Digital marketing',
      'Advanced Facebook ads',
      'Drop shipping',
      'Advanced sales techniques (Closing sales in 15 Days)',
    ],
    chip: 'Complete transformation',
    showOnLanding: true,
    highlight: true,
    badge: 'Most Popular',
    savings: 'Active income ₹5599 | Passive ₹799',
    description:
      'The complete business toolkit: e-commerce, email marketing, Facebook ads, drop shipping and advanced sales closing.',
    accent: 'from-primary/80 via-primary/30 to-transparent',
    courseIds: [],
  },
  {
    id: 'higher',
    name: 'Higher Package',
    tagline: 'Start your journey',
    price: 5999,
    promoPrice: 3999,
    period: 'one-time',
    features: [
      'Everything in premium package',
      'Google ads',
      'Figma',
      'Meta ads',
      'Facebook ads',
      'OLX ads',
      'Resume building for top companies',
    ],
    chip: 'Growth toolkit',
    showOnLanding: true,
    savings: 'Active income ₹2799 | Passive ₹399',
    description:
      'Master paid ads across Google, Meta, Facebook and OLX plus Figma and resume building for top company placements.',
    accent: 'from-emerald-700/70 via-emerald-500/35 to-transparent',
    courseIds: [],
  },
];


/** Aligns with `DEFAULT_LANDING_PRICING_TIERS` column order (starter → pro → elite). */
export const DEFAULT_PRICING_COMPARE_ROWS: LandingPricingCompareRow[] = [
  { label: 'Course access', cells: ['10 starter', 'All 200+', 'All 200+ + future'] },
  { label: 'Mentor support', cells: ['—', 'Group sessions', '1-on-1 weekly'] },
  { label: 'Project reviews', cells: ['—', '✓', 'Priority'] },
  { label: 'Certificates', cells: ['Basic', 'Verified', 'Verified + LinkedIn'] },
  { label: 'Job placement', cells: ['—', '—', '✓'] },
  { label: 'Offline downloads', cells: ['—', '✓', '✓'] },
];
