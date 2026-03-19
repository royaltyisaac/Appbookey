import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserTier } from '../types';
import { TIER_CONFIG } from '../constants/tiers';

interface UserState {
  tier: UserTier;
  booksGenerated: number;
  isLoading: boolean;
  setTier: (tier: UserTier) => Promise<void>;
  incrementBooksGenerated: () => Promise<void>;
  loadUserData: () => Promise<void>;
  canGenerateBook: () => boolean;
  getMaxPages: () => number;
  hasWatermark: () => boolean;
  getAvailableCoverModels: () => ('flux' | 'gptimage')[];
}

export const useUserStore = create<UserState>((set, get) => ({
  tier: 'free',
  booksGenerated: 0,
  isLoading: true,

  setTier: async (tier: UserTier) => {
    await AsyncStorage.setItem('user_tier', tier);
    set({ tier });
  },

  incrementBooksGenerated: async () => {
    const newCount = get().booksGenerated + 1;
    await AsyncStorage.setItem('books_generated', String(newCount));
    set({ booksGenerated: newCount });
  },

  loadUserData: async () => {
    try {
      const [tier, count] = await Promise.all([
        AsyncStorage.getItem('user_tier'),
        AsyncStorage.getItem('books_generated'),
      ]);
      set({
        tier: (tier as UserTier) || 'free',
        booksGenerated: count ? parseInt(count, 10) : 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  canGenerateBook: () => {
    const { tier, booksGenerated } = get();
    const config = TIER_CONFIG[tier];
    return booksGenerated < config.maxBooks;
  },

  getMaxPages: () => {
    const { tier } = get();
    return TIER_CONFIG[tier].maxPagesPerBook;
  },

  hasWatermark: () => {
    const { tier } = get();
    return TIER_CONFIG[tier].watermark;
  },

  getAvailableCoverModels: () => {
    const { tier } = get();
    return TIER_CONFIG[tier].coverModels;
  },
}));
