import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Document } from '../types';
import { countWords } from '../utils/tokenizer';
import { useSessionsStore } from './sessionsStore';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface AddInput {
  title: string;
  text: string;
  sourceType?: string;
}

interface LibraryState {
  documents: Document[];
  add: (input: AddInput) => Document;
  remove: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      documents: [],
      add: ({ title, text, sourceType = 'text' }) => {
        const doc: Document = {
          id: uid(),
          title: title.trim() || 'Untitled',
          source_type: sourceType,
          text_content: text,
          word_count: countWords(text),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ documents: [doc, ...state.documents] }));
        return doc;
      },
      remove: (id) => {
        set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
        // Drop the matching reading session too.
        useSessionsStore.getState().remove(id);
      },
    }),
    {
      name: 'payye.library',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
