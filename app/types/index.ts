export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Document {
  id: string;
  title: string;
  source_type: string;
  file_url?: string | null;
  word_count: number;
  created_at: string;
}

export interface DocumentDetail extends Document {
  text_content: string;
}

export type SessionStatus = 'active' | 'paused' | 'completed';

export interface ReadingSession {
  id: string;
  document_id: string;
  current_word_index: number;
  wpm: number;
  status: SessionStatus;
  started_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface SessionWithDocument extends ReadingSession {
  document: Document;
}

export interface UserSettings {
  default_wpm: number;
  theme: 'dark' | 'light';
  font_size: number;
  pause_on_punctuation: boolean;
}

export interface SummaryResponse {
  document_id: string;
  summary: string;
  cached: boolean;
}

export interface KeywordsResponse {
  document_id: string;
  keywords: string[];
  difficulty_level: string;
  cached: boolean;
}

export interface VocabularyResponse {
  word: string;
  definition: string;
  example?: string | null;
}
