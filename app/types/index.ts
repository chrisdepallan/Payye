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
  // Reading statistics. Optional so sessions saved before this feature still load.
  words_read?: number; // total words advanced through while reading (re-reads count)
  time_spent_ms?: number; // accumulated active reading time
  started_at?: string; // first time the book was opened
  completed_at?: string; // when the book was finished
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

// --- Free-ebook discovery (fetched directly from public sources) ---
export interface BookSource {
  id: string; // also used as Document.source_type, e.g. "gutenberg"
  name: string;
  supportsLanguage: boolean;
  supportsTopic: boolean;
}

export interface BookSummary {
  source: string;
  id: string;
  title: string;
  authors: string[];
  languages: string[];
  subjects: string[];
  coverUrl?: string | null;
  downloadCount?: number | null;
}

export interface BookSearchPage {
  results: BookSummary[];
  nextPage: number | null;
}

export interface BookText {
  title: string;
  text: string;
}

export interface BookSearchOptions {
  language?: string; // ISO-639-1, e.g. "en"
  topic?: string;
  page?: number;
}
