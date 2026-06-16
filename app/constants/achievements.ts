import { Ionicons } from '@expo/vector-icons';

/**
 * Achievement catalog. Each badge unlocks when a single aggregate metric crosses
 * its threshold. Metrics are computed on-device in `utils/stats` + the stats
 * store; unlocking just persists the moment a threshold was first reached.
 */

export type AchievementMetric = 'words' | 'books' | 'minutes' | 'streak' | 'wpm';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  metric: AchievementMetric;
  threshold: number;
}

/** Live values the catalog is evaluated against. */
export interface AchievementMetrics {
  words: number; // total words read
  books: number; // books completed
  minutes: number; // total minutes spent reading
  streak: number; // current consecutive-day streak
  wpm: number; // highest WPM ever used
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-words', title: 'First Steps', description: 'Read your first 100 words', icon: 'footsteps-outline', metric: 'words', threshold: 100 },
  { id: 'words-1k', title: 'Getting Started', description: 'Read 1,000 words', icon: 'walk-outline', metric: 'words', threshold: 1_000 },
  { id: 'words-10k', title: 'Bookworm', description: 'Read 10,000 words', icon: 'book-outline', metric: 'words', threshold: 10_000 },
  { id: 'words-50k', title: 'Voracious', description: 'Read 50,000 words', icon: 'library-outline', metric: 'words', threshold: 50_000 },
  { id: 'words-100k', title: 'Word Marathon', description: 'Read 100,000 words', icon: 'trophy-outline', metric: 'words', threshold: 100_000 },

  { id: 'book-1', title: 'The End', description: 'Finish your first book', icon: 'checkmark-done-outline', metric: 'books', threshold: 1 },
  { id: 'book-5', title: 'Shelf Builder', description: 'Finish 5 books', icon: 'albums-outline', metric: 'books', threshold: 5 },
  { id: 'book-10', title: 'Librarian', description: 'Finish 10 books', icon: 'school-outline', metric: 'books', threshold: 10 },

  { id: 'time-60', title: 'In the Zone', description: 'Spend 1 hour reading', icon: 'time-outline', metric: 'minutes', threshold: 60 },
  { id: 'time-300', title: 'Devoted Reader', description: 'Spend 5 hours reading', icon: 'hourglass-outline', metric: 'minutes', threshold: 300 },

  { id: 'streak-3', title: 'On a Roll', description: 'Read 3 days in a row', icon: 'flame-outline', metric: 'streak', threshold: 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Read 7 days in a row', icon: 'flame', metric: 'streak', threshold: 7 },

  { id: 'wpm-400', title: 'Speed Reader', description: 'Read at 400+ WPM', icon: 'flash-outline', metric: 'wpm', threshold: 400 },
  { id: 'wpm-600', title: 'Lightning Eyes', description: 'Read at 600+ WPM', icon: 'flash', metric: 'wpm', threshold: 600 },
];

/** IDs of every achievement currently earned for the given metrics. */
export function earnedAchievementIds(m: AchievementMetrics): string[] {
  return ACHIEVEMENTS.filter((a) => m[a.metric] >= a.threshold).map((a) => a.id);
}
