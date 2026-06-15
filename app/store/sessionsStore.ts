import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SessionRecord } from '../types';

type SessionPatch = Partial<Omit<SessionRecord, 'documentId' | 'updated_at'>>;

interface SessionsState {
  sessions: Record<string, SessionRecord>;
  upsert: (documentId: string, patch: SessionPatch) => void;
  remove: (documentId: string) => void;
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set) => ({
      sessions: {},
      upsert: (documentId, patch) =>
        set((state) => {
          const existing = state.sessions[documentId];
          const merged: SessionRecord = {
            documentId,
            current_word_index: 0,
            wpm: 250,
            status: 'active',
            ...existing,
            ...patch,
            updated_at: new Date().toISOString(),
          };
          return { sessions: { ...state.sessions, [documentId]: merged } };
        }),
      remove: (documentId) =>
        set((state) => {
          const next = { ...state.sessions };
          delete next[documentId];
          return { sessions: next };
        }),
    }),
    {
      name: 'payye.sessions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Most recently updated session that isn't finished — powers "Continue reading". */
export function selectCurrentSession(
  sessions: Record<string, SessionRecord>,
): SessionRecord | undefined {
  return Object.values(sessions)
    .filter((s) => s.status !== 'completed')
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
}

export function selectSessionHistory(
  sessions: Record<string, SessionRecord>,
): SessionRecord[] {
  return Object.values(sessions).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );
}
