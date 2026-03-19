import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

function generateUserId(): string {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  signUp: async (email: string, password: string, displayName: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existing = await AsyncStorage.getItem(`account_${trimmedEmail}`);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const user: UserAccount = {
      id: generateUserId(),
      email: trimmedEmail,
      displayName: displayName.trim(),
      createdAt: Date.now(),
    };

    // Store account (password hashed in production - simplified for client-side demo)
    await AsyncStorage.setItem(`account_${trimmedEmail}`, JSON.stringify({ user, password }));
    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  signIn: async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const stored = await AsyncStorage.getItem(`account_${trimmedEmail}`);

    if (!stored) {
      throw new Error('No account found with this email');
    }

    const { user, password: storedPassword } = JSON.parse(stored);
    if (password !== storedPassword) {
      throw new Error('Incorrect password');
    }

    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  signOut: async () => {
    await AsyncStorage.removeItem('current_user');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const data = await AsyncStorage.getItem('current_user');
      if (data) {
        const user: UserAccount = JSON.parse(data);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
