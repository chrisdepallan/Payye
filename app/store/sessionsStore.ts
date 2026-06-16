import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SessionRecord } from '../types';

type SessionPatch = Partial<Omit<SessionRecord, 'documentId' | 'updated_at'>>;

/** Reading effort to add to a session's running totals. */
interface ActivityDelta {
  wordsRead: number;
  timeMs: number;
}

interface SessionsState {
  sessions: Record<string, SessionRecord>;
  upsert: (documentId: string, patch: SessionPatch) => void;
  accumulate: (documentId: string, delta: ActivityDelta) => void;
  remove: (documentId: string) => void;
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set) => ({
      sessions: {},
      upsert: (documentId, patch) =>
        set((state) => {
          const existing = state.sessions[documentId];
          const nowIso = new Date().toISOString();
          const status = patch.status ?? existing?.status ?? 'active';
          const merged: SessionRecord = {
            documentId,
            current_word_index: 0,
            wpm: 250,
            status: 'active',
            words_read: 0,
            time_spent_ms: 0,
            ...existing,
            ...patch,
            started_at: existing?.started_at ?? nowIso,
            completed_at:
              status === 'completed'
                ? (existing?.completed_at ?? nowIso)
                : existing?.completed_at,
            updated_at: nowIso,
          };
          return { sessions: { ...state.sessions, [documentId]: merged } };
        }),
      accumulate: (documentId, delta) =>
        set((state) => {
          const existing = state.sessions[documentId];
          if (!existing) return {} as Partial<SessionsState>;
          if (delta.wordsRead <= 0 && delta.timeMs <= 0) {
            return {} as Partial<SessionsState>;
          }
          const merged: SessionRecord = {
            ...existing,
            words_read: (existing.words_read ?? 0) + Math.max(0, delta.wordsRead),
            time_spent_ms: (existing.time_spent_ms ?? 0) + Math.max(0, delta.timeMs),
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
