import { MarketingTool } from './marketing-tool.schema';

export const DEFAULT_MARKETING_TOOLS: Omit<MarketingTool, 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Promotional Banners',
    description: 'High-quality banners for Instagram and Facebook stories.',
    icon: 'image',
    assetCount: 12,
    downloadUrl: '',
    previewUrl: '',
    tone: 'from-primary/15 to-transparent border-primary/20',
    order: 0,
    active: true,
  },
  {
    title: 'Marketing Videos',
    description: 'Short reels and testimonial videos for promotion.',
    icon: 'video',
    assetCount: 5,
    downloadUrl: '',
    previewUrl: '',
    tone: 'from-accent/20 to-transparent border-accent/25',
    order: 1,
    active: true,
  },
];
