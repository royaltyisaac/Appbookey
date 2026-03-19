import { UserTier } from '../types';

export interface TierConfig {
  name: string;
  maxBooks: number;
  maxPagesPerBook: number;
  watermark: boolean;
  coverModels: ('flux' | 'gptimage')[];
  features: string[];
}

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  free: {
    name: 'Free',
    maxBooks: 1,
    maxPagesPerBook: 20,
    watermark: true,
    coverModels: ['flux'],
    features: [
      '1 ebook generation',
      'Up to 20 pages',
      'Flux cover art',
      'Watermarked output',
    ],
  },
  pro: {
    name: 'Pro',
    maxBooks: 999,
    maxPagesPerBook: 200,
    watermark: false,
    coverModels: ['flux', 'gptimage'],
    features: [
      'Unlimited ebook generation',
      'Up to 200 pages per book',
      'Premium GPT Image covers',
      'No watermark',
      'Priority generation',
    ],
  },
};

export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Literary Fiction',
  'Young Adult',
  'Children\'s',
  'Non-Fiction',
  'Self-Help',
  'Biography',
  'Business',
  'Technology',
  'Poetry',
];

export const COVER_STYLES = [
  'Minimalist Modern',
  'Classic Literary',
  'Bold Typography',
  'Illustrated Scene',
  'Abstract Art',
  'Photorealistic',
  'Vintage Retro',
  'Dark & Moody',
  'Bright & Colorful',
  'Elegant Gold',
];
