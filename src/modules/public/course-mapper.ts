import { Course } from '../courses/course.schema';

/** Explorer `Course` shape (matches `edupath-explorer` catalog + detail). */
export type ExplorerCourseVideoDto = {
  id: string;
  title: string;
  duration: string;
  /** True until the learner enrolls (or free preview with URL). */
  locked?: boolean;
  freePreview?: boolean;
  /** Only set for free-preview lessons with a URL (public marketing page). */
  videoUrl?: string;
};

/** Explorer `Course` shape (matches `edupath-explorer` catalog + detail). */
export type ExplorerCourseDto = {
  id: string;
  /** MongoDB course id — use for checkout / purchases */
  courseId: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  level: string;
  price: number;
  cover: string;
  description: string;
  videos: ExplorerCourseVideoDto[];
  /** Sidebar + marketing — from `highlights` or sensible defaults */
  whatYouLearn: string[];
  /** Checkout card bullets — from `benefits` or defaults */
  enrollmentBullets: string[];
  /** Admin CKEditor HTML (`fullDescription`) — trusted, render with care on client */
  bodyHtml?: string;
  /** Strikethrough MRP / list price shown next to `price` */
  strikePrice: number;
  /** Whole number % off for badge (derived from strike vs effective if needed) */
  discountPercent: number;
};

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=70';

const DEFAULT_WHAT_YOU_LEARN = [
  'Build production-ready apps from scratch',
  'Master modern patterns and best practices',
  'Deploy to the cloud with CI/CD',
  'Earn a verified certificate',
  'Get personal mentor feedback',
];

const DEFAULT_ENROLLMENT_BULLETS = [
  'Lifetime access',
  'Verified certificate',
  '30-day money back',
  'Mobile + offline access',
];

/** Resolve stored path or absolute URL for lesson / thumbnail media. */
export function resolveMediaUrl(raw: string | undefined | null, mediaBase?: string): string | undefined {
  const u = (raw || '').trim();
  if (!u) return undefined;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/') && mediaBase) {
    return `${String(mediaBase).replace(/\/$/, '')}${u}`;
  }
  if (u.startsWith('/')) return undefined;
  return u;
}

function resolveCoverUrl(course: Course | Record<string, any>, mediaBase?: string): string {
  const v0 = (course as any).videos?.[0];
  const legacyVideo = typeof v0 === 'string' && v0.trim() ? v0.trim() : undefined;
  const candidates = [course.thumbnailUrl, course.images?.[0], course.bannerUrl, legacyVideo];
  for (const c of candidates) {
    const resolved = resolveMediaUrl(typeof c === 'string' ? c : undefined, mediaBase);
    if (resolved) return resolved;
  }
  return DEFAULT_COVER;
}

function formatDuration(totalSec: number): string {
  if (!totalSec || totalSec <= 0) return '—';
  const h = Math.round(totalSec / 3600);
  if (h >= 1) return `${h}h`;
  const m = Math.round(totalSec / 60);
  return `${m}m`;
}

function formatLessonDuration(durationSec: number): string {
  if (!durationSec || durationSec <= 0) return '—';
  const m = Math.floor(durationSec / 60);
  const s = Math.floor(durationSec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export type FlatLessonRow = {
  id: string;
  title: string;
  durationSec: number;
  freePreview?: boolean;
  rawVideoUrl?: string;
};

/** Stable ids `m{module}-l{lesson}` — keep in sync with enrolled curriculum merge on the client. */
export function flattenLessonsFromModules(modules: any): FlatLessonRow[] {
  const out: FlatLessonRow[] = [];
  if (!modules?.length) return out;
  (modules as any[]).forEach((mod, mi) => {
    (mod.lessons || []).forEach((les: any, li: number) => {
      out.push({
        id: `m${mi}-l${li}`,
        title: les.title,
        durationSec: Number(les.durationSec) || 0,
        freePreview: Boolean(les.freePreview),
        rawVideoUrl: typeof les.videoUrl === 'string' ? les.videoUrl : undefined,
      });
    });
  });
  return out;
}

/** Full modules + resolved video URLs for enrolled learners (or admin). */
export function mapCourseModulesForCurriculum(course: Course | Record<string, any>, mediaBase?: string) {
  const modules = (course as any).modules || [];
  return modules.map((mod: any, mi: number) => ({
    title: mod.title,
    order: mod.order ?? mi,
    lessons: (mod.lessons || []).map((les: any, li: number) => ({
      id: `m${mi}-l${li}`,
      title: les.title,
      slug: les.slug,
      order: les.order ?? li,
      durationSec: Number(les.durationSec) || 0,
      freePreview: Boolean(les.freePreview),
      notes: les.notes,
      videoUrl: resolveMediaUrl(les.videoUrl, mediaBase),
    })),
  }));
}

function pickBodyHtml(course: Course | Record<string, any>): string | undefined {
  const raw = (course as any).fullDescription;
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  return t;
}

function resolvePricing(course: Course | Record<string, any>): {
  effective: number;
  strikePrice: number;
  discountPercent: number;
} {
  const discountPrice = Number((course as any).discountPrice) || 0;
  const listPrice = Number((course as any).price) || 0;
  const originalPrice = Number((course as any).originalPrice) || 0;
  const effective = discountPrice > 0 ? discountPrice : listPrice;
  let strike = originalPrice > effective ? originalPrice : 0;
  if (!strike || strike <= effective) {
    strike = Math.max(Math.round(effective * 1.6), effective + 1);
  }
  let pct = Math.round(Number((course as any).offerPercent) || 0);
  if (!pct && strike > effective) {
    pct = Math.round((1 - effective / strike) * 100);
  }
  if (!pct || pct < 1) pct = Math.min(90, Math.max(5, Math.round((1 - effective / strike) * 100)));
  return { effective, strikePrice: strike, discountPercent: pct };
}

/** Accepts Mongoose document or lean object */
export function mapCourseToExplorerDto(
  course: Course | Record<string, any>,
  categoryName: string,
  mediaBase?: string,
): ExplorerCourseDto {
  const flatLessons = flattenLessonsFromModules(course.modules);
  const totalSec = flatLessons.reduce((s, l) => s + (l.durationSec || 0), 0);
  const duration =
    course.durationLabel ||
    (totalSec > 0 ? formatDuration(totalSec) : course.videos?.length ? `${course.videos.length * 2}h` : '—');
  const fromModules = flatLessons.length;
  const lessonCount =
    course.lessonCount > 0
      ? course.lessonCount
      : fromModules > 0
        ? fromModules
        : Math.max(1, (course as any).videos?.length || 0);
  const { effective: price, strikePrice, discountPercent } = resolvePricing(course);
  const cover = resolveCoverUrl(course, mediaBase);

  const videos: ExplorerCourseVideoDto[] = flatLessons.slice(0, 80).map((l) => {
    const resolved = resolveMediaUrl(l.rawVideoUrl, mediaBase);
    const playableGuest = Boolean(l.freePreview) && Boolean(resolved);
    return {
      id: l.id,
      title: l.title,
      duration: l.durationSec > 0 ? formatLessonDuration(l.durationSec) : '—',
      locked: !playableGuest,
      freePreview: Boolean(l.freePreview),
      videoUrl: playableGuest ? resolved : undefined,
    };
  });

  if (!videos.length && course.videos?.length) {
    (course.videos as string[]).slice(0, 8).forEach((_url: string, i: number) => {
      videos.push({
        id: `legacy-v${i}`,
        title: `Lesson ${i + 1}`,
        duration: '12:00',
        locked: true,
        freePreview: false,
      });
    });
  }

  const highlights = Array.isArray(course.highlights) ? course.highlights.filter((x: string) => x?.trim()) : [];
  const benefits = Array.isArray(course.benefits) ? course.benefits.filter((x: string) => x?.trim()) : [];

  const whatYouLearn = highlights.length ? highlights : DEFAULT_WHAT_YOU_LEARN;
  const enrollmentBullets = benefits.length ? benefits : DEFAULT_ENROLLMENT_BULLETS;
  const bodyHtml = pickBodyHtml(course);

  return {
    id: course.slug,
    courseId: (course as any)._id?.toString?.() ?? course.slug,
    title: course.title,
    category: categoryName || 'General',
    instructor: course.instructorName || 'Expert Instructor',
    rating: course.ratingAvg > 0 ? Math.round(course.ratingAvg * 10) / 10 : 4.8,
    students: course.salesCount || 0,
    duration,
    lessons: lessonCount,
    level: course.level || 'Intermediate',
    price,
    cover,
    description:
      (course.shortDescription && String(course.shortDescription).trim()) ||
      (course.fullDescription && String(course.fullDescription).replace(/<[^>]+>/g, ' ').trim().slice(0, 280)) ||
      '',
    videos: videos.length ? videos : [{ id: 'v1', title: 'Introduction', duration: '10:00', locked: true }],
    whatYouLearn,
    enrollmentBullets,
    bodyHtml,
    strikePrice,
    discountPercent,
  };
}
