/**
 * Reading-statistics helpers.
 *
 * Everything is derived on-device from the local library + session records, so
 * the backend stays stateless. Per-book stats come straight off `SessionRecord`;
 * streaks come off the per-day word buckets kept in the stats store.
 */

import { Document, SessionRecord, SessionStatus } from '../types';
import { estimateMinutesRemaining } from './readerTiming';

/** Local-time YYYY-MM-DD key — used to bucket reading by day for streaks. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Consecutive days (ending today) with any reading. Today not having any reading
 * yet does not break the streak — it only breaks once a full day is missed.
 */
export function computeStreak(
  dailyWords: Record<string, number>,
  today: Date = new Date(),
): number {
  const hasRead = (d: Date) => (dailyWords[dayKey(d)] ?? 0) > 0;
  const cursor = new Date(today);
  if (!hasRead(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (hasRead(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface BookStat {
  document: Document;
  status: SessionStatus | 'new';
  index: number; // current_word_index
  percent: number; // 0..1 reading position
  wordsLeft: number;
  wordsRead: number; // accumulated effort (re-reads included)
  timeSpentMs: number;
  estTimeLeftMs: number;
  wpm: number;
  updatedAt?: string;
}

export interface OverallStats {
  totalWordsRead: number;
  totalTimeMs: number;
  booksStarted: number;
  booksCompleted: number;
  maxWpm: number;
  books: BookStat[];
}

function bookStat(document: Document, session?: SessionRecord): BookStat {
  const total = document.word_count;
  const index = session?.current_word_index ?? 0;
  const wpm = session?.wpm ?? 0;
  const percent = total > 0 ? Math.min(index / total, 1) : 0;
  const wordsLeft = Math.max(0, total - index);
  const estTimeLeftMs =
    estimateMinutesRemaining(wordsLeft, wpm || 250) * 60_000;
  return {
    document,
    status: session?.status ?? 'new',
    index,
    percent,
    wordsLeft,
    wordsRead: session?.words_read ?? 0,
    timeSpentMs: session?.time_spent_ms ?? 0,
    estTimeLeftMs,
    wpm,
    updatedAt: session?.updated_at,
  };
}

/** Roll the library + sessions up into per-book rows and overall totals. */
export function aggregateStats(
  documents: Document[],
  sessions: Record<string, SessionRecord>,
): OverallStats {
  const books = documents
    .map((doc) => bookStat(doc, sessions[doc.id]))
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

  let totalWordsRead = 0;
  let totalTimeMs = 0;
  let booksStarted = 0;
  let booksCompleted = 0;
  let maxWpm = 0;

  Object.values(sessions).forEach((s) => {
    totalWordsRead += s.words_read ?? 0;
    totalTimeMs += s.time_spent_ms ?? 0;
    booksStarted += 1;
    if (s.status === 'completed') booksCompleted += 1;
    if (s.wpm > maxWpm) maxWpm = s.wpm;
  });

  return { totalWordsRead, totalTimeMs, booksStarted, booksCompleted, maxWpm, books };
}

/** "2h 14m" / "9m 30s" / "45s" — for total/elapsed reading time. */
export function formatLongDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** "1.2K" / "45K" / "3.1M" — compact word counts for stat tiles. */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${n >= 10_000 ? Math.round(k) : k.toFixed(1)}K`;
  }
  return `${Math.round(n)}`;
}
