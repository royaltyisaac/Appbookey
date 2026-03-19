export type UserTier = 'free' | 'pro';

export interface UserProfile {
  tier: UserTier;
  apiKey: string | null;
  booksGenerated: number;
}

export interface BookChapter {
  title: string;
  content: string;
  pageCount: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  chapters: BookChapter[];
  coverUrl: string | null;
  coverModel: 'flux' | 'gptimage';
  createdAt: number;
  totalPages: number;
  isWatermarked: boolean;
}

export interface GenerationConfig {
  title: string;
  genre: string;
  description: string;
  targetPages: number;
  chapterCount: number;
  coverStyle: string;
  coverModel: 'flux' | 'gptimage';
  author: string;
}

export interface GenerationProgress {
  stage: 'outline' | 'chapters' | 'cover' | 'finalizing' | 'complete' | 'error';
  currentChapter: number;
  totalChapters: number;
  message: string;
  progress: number; // 0-100
}
