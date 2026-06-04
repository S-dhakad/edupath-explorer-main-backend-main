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

/** Homepage pricing tiers — matches explorer `plans` + cover copy */
export const DEFAULT_LANDING_PRICING_TIERS: LandingPricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect to dip your toes in',
    price: 499,
    period: 'month',
    features: [
      'Access to 10 starter courses',
      'Community support',
      'Mobile app access',
      'Certificate on completion',
    ],
    highlight: false,
    chip: '10 starter courses',
    savings: 'Best for first-time learners',
    description:
      'Start with curated beginner courses, community support, and certificates while you explore which skill path fits you best.',
    accent: 'from-primary/70 via-primary/40 to-transparent',
    courseIds: [],
  },
  {
    id: 'pro',
    name: 'Pro Learner',
    tagline: 'Most popular for serious learners',
    price: 1499,
    period: 'month',
    features: [
      'Access to all 200+ courses',
      'Live mentorship sessions',
      'Project reviews',
      'Verified certificates',
      'Offline downloads',
    ],
    highlight: true,
    badge: 'Most Popular',
    chip: '200+ full library',
    savings: 'Save ₹3,000+ vs buying courses',
    description:
      'Unlock the full Star Success library with live mentorship, project reviews, verified certificates, and offline access for serious learners.',
    accent: 'from-white/35 via-white/10 to-transparent',
    courseIds: [],
  },
  {
    id: 'elite',
    name: 'Elite Career',
    tagline: 'Career-changing transformation',
    price: 3999,
    period: 'month',
    features: [
      'Everything in Pro',
      '1-on-1 weekly coaching',
      'Job placement assistance',
      'Resume & interview prep',
      'Lifetime course access',
    ],
    badge: 'Best Value',
    chip: 'Career transformation',
    savings: 'Includes placement support',
    description:
      'Go beyond courses with weekly 1-on-1 coaching, placement assistance, interview prep, and lifetime access for a full career switch.',
    accent: 'from-accent/80 via-accent/35 to-transparent',
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
