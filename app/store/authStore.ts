import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { User } from '../types';

const TOKEN_KEY = 'payye.token';
const USER_KEY = 'payye.user';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setAuth: async (token, user) => {
    set({ token, user });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  logout: async () => {
    set({ token: null, user: null });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      set({
        token: token ?? null,
        user: userRaw ? (JSON.parse(userRaw) as User) : null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));
