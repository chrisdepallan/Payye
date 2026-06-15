import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { UserSettings } from '../types';

interface SettingsState extends UserSettings {
  update: (partial: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      default_wpm: 250,
      theme: 'dark',
      font_size: 48,
      pause_on_punctuation: true,
      update: (partial) => set(partial),
    }),
    {
      name: 'payye.settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        default_wpm: state.default_wpm,
        theme: state.theme,
        font_size: state.font_size,
        pause_on_punctuation: state.pause_on_punctuation,
      }),
    },
  ),
);
