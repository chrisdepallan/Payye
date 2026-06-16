/**
 * Reader timing engine (section 8 of the guide).
 *
 * Base interval per word:  interval_ms = 60000 / WPM
 * Then adjusted for:
 *   - sentence / clause punctuation (longer pauses)
 *   - long words (held slightly longer)
 */

export interface TimingOptions {
  wpm: number;
  pauseOnPunctuation: boolean;
  // Hold longer words a touch longer than the base interval. Defaults to on.
  longWordSlowdown?: boolean;
}

const SENTENCE_END = /[.!?]["')\]]*$/;
const CLAUSE_END = /[,;:]["')\]]*$/;
const DASH_END = /[—–-]$/;

export function baseInterval(wpm: number): number {
  return 60000 / Math.max(wpm, 1);
}

export function intervalForToken(token: string, options: TimingOptions): number {
  const base = baseInterval(options.wpm);
  let multiplier = 1;

  // Long-word adjustment: each character beyond 8 adds a little dwell time.
  if (options.longWordSlowdown !== false && token.length > 8) {
    multiplier += Math.min((token.length - 8) * 0.04, 0.6);
  }

  if (options.pauseOnPunctuation) {
    if (SENTENCE_END.test(token)) {
      multiplier += 1.2;
    } else if (CLAUSE_END.test(token)) {
      multiplier += 0.5;
    } else if (DASH_END.test(token)) {
      multiplier += 0.4;
    }
  }

  return Math.round(base * multiplier);
}

/**
 * Optimal Recognition Point: the letter the eye should fixate on. Roughly the
 * 30% mark of the word, which keeps the gaze still while words flash by.
 */
export function orpIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function estimateMinutesRemaining(
  wordsRemaining: number,
  wpm: number,
): number {
  return wordsRemaining / Math.max(wpm, 1);
}
