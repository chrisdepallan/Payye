import { create } from 'zustand';

import { tokenize } from '../utils/tokenizer';

function clamp(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export interface ReaderLoadParams {
  sessionId: string;
  documentId: string;
  title: string;
  text: string;
  startIndex: number;
  wpm: number;
  pauseOnPunctuation: boolean;
}

interface ReaderState {
  sessionId: string | null;
  documentId: string | null;
  title: string;
  tokens: string[];
  index: number;
  isPlaying: boolean;
  wpm: number;
  pauseOnPunctuation: boolean;

  load: (params: ReaderLoadParams) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setIndex: (index: number) => void;
  skip: (delta: number) => void;
  setWpm: (wpm: number) => void;
  setPauseOnPunctuation: (value: boolean) => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  sessionId: null,
  documentId: null,
  title: '',
  tokens: [],
  index: 0,
  isPlaying: false,
  wpm: 250,
  pauseOnPunctuation: true,

  load: ({ sessionId, documentId, title, text, startIndex, wpm, pauseOnPunctuation }) => {
    const tokens = tokenize(text);
    set({
      sessionId,
      documentId,
      title,
      tokens,
      index: clamp(startIndex, tokens.length),
      wpm,
      pauseOnPunctuation,
      isPlaying: false,
    });
  },

  play: () => {
    if (get().tokens.length > 0) set({ isPlaying: true });
  },
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: s.tokens.length > 0 ? !s.isPlaying : false })),
  setIndex: (index) => set((s) => ({ index: clamp(index, s.tokens.length) })),
  skip: (delta) => set((s) => ({ index: clamp(s.index + delta, s.tokens.length) })),
  setWpm: (wpm) => set({ wpm }),
  setPauseOnPunctuation: (value) => set({ pauseOnPunctuation: value }),
  reset: () =>
    set({
      sessionId: null,
      documentId: null,
      title: '',
      tokens: [],
      index: 0,
      isPlaying: false,
    }),
}));
