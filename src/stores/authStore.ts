import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  apiKey: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
  loadApiKey: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  apiKey: null,
  isAuthenticated: false,
  isLoading: true,

  setApiKey: async (key: string) => {
    await AsyncStorage.setItem('pollinations_api_key', key);
    set({ apiKey: key, isAuthenticated: true });
  },

  clearApiKey: async () => {
    await AsyncStorage.removeItem('pollinations_api_key');
    set({ apiKey: null, isAuthenticated: false });
  },

  loadApiKey: async () => {
    try {
      const key = await AsyncStorage.getItem('pollinations_api_key');
      set({ apiKey: key, isAuthenticated: !!key, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
