import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../types';

interface BookState {
  books: Book[];
  isLoading: boolean;
  addBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  loadBooks: () => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  isLoading: true,

  addBook: async (book: Book) => {
    const updated = [book, ...get().books];
    await AsyncStorage.setItem('books', JSON.stringify(updated));
    set({ books: updated });
  },

  removeBook: async (id: string) => {
    const updated = get().books.filter((b) => b.id !== id);
    await AsyncStorage.setItem('books', JSON.stringify(updated));
    set({ books: updated });
  },

  getBook: (id: string) => {
    return get().books.find((b) => b.id === id);
  },

  loadBooks: async () => {
    try {
      const data = await AsyncStorage.getItem('books');
      set({ books: data ? JSON.parse(data) : [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
