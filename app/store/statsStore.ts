import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dayKey } from '../utils/stats';

/**
 * Global reading stats kept on-device:
 *   - `dailyWords`: words read per calendar day, powering streaks + a daily view.
 *   - `unlocked`: achievement id -> ISO timestamp it was first earned.
 *
 * Per-book totals (words/time) live on each SessionRecord; this store only holds
 * what can't be derived from a single session.
 */
interface StatsState {
  dailyWords: Record<string, number>;
  unlocked: Record<string, string>;
  /** Add words to today's bucket (called as the reader advances). */
  recordReading: (words: number) => void;
  /**
   * Persist unlock timestamps for any newly-earned achievements and return the
   * ids that were just unlocked (for an optional celebration).
   */
  syncAchievements: (earnedIds: string[]) => string[];
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      dailyWords: {},
      unlocked: {},
      recordReading: (words) =>
        set((state) => {
          if (words <= 0) return {} as Partial<StatsState>;
          const key = dayKey();
          return {
            dailyWords: {
              ...state.dailyWords,
              [key]: (state.dailyWords[key] ?? 0) + words,
            },
          };
        }),
      syncAchievements: (earnedIds) => {
        const { unlocked } = get();
        const newly = earnedIds.filter((id) => !unlocked[id]);
        if (newly.length === 0) return [];
        const nowIso = new Date().toISOString();
        const next = { ...unlocked };
        newly.forEach((id) => {
          next[id] = nowIso;
        });
        set({ unlocked: next });
        return newly;
      },
    }),
    {
      name: 'payye.stats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
