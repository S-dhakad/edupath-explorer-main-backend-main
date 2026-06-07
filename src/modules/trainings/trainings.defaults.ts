import { Training } from './training.schema';

export const DEFAULT_TRAININGS: Omit<Training, 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Affiliate Marketing Mastery',
    description: 'Learn the fundamentals of affiliate marketing and start your journey.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    videoUrl: '',
    duration: '2.5 Hours',
    lessonCount: 12,
    rating: 4.8,
    order: 0,
    active: true,
  },
  {
    title: 'Instagram Growth Secrets',
    description: 'Build a personal brand and attract high-quality leads on Instagram.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    videoUrl: '',
    duration: '4 Hours',
    lessonCount: 18,
    rating: 4.9,
    order: 1,
    active: true,
  },
];
