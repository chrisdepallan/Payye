// All user data lives on the device. These are the local shapes.

import { ThemeName } from '../constants/theme';

export interface Document {
  id: string;
  title: string;
  source_type: string; // "text" | "txt" | "pdf"
  text_content: string;
  word_count: number;
  created_at: string;
}

export type SessionStatus = 'active' | 'paused' | 'completed';

export interface SessionRecord {
  documentId: string;
  current_word_index: number;
  wpm: number;
  status: SessionStatus;
  updated_at: string;
}

export interface UserSettings {
  default_wpm: number;
  theme: ThemeName;
  font_size: number;
  pause_on_punctuation: boolean;
}

// --- AI responses (from the stateless backend) ---
export interface SummaryResponse {
  summary: string;
}

export interface KeywordsResponse {
  keywords: string[];
  difficulty_level: string;
}

export interface VocabularyResponse {
  word: string;
  definition: string;
  example?: string | null;
}

export interface ExtractResponse {
  text: string;
  word_count: number;
  source_type: string;
}
