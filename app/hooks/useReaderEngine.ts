import { useEffect } from 'react';

import { useReaderStore } from '../store/readerStore';
import { intervalForToken } from '../utils/readerTiming';

interface ReaderEngineOptions {
  onComplete?: () => void;
}

/**
 * Drives the word-by-word playback. While playing, it schedules a timeout for
 * the current token (interval derived from WPM + punctuation/long-word rules),
 * advances one word, and re-runs. At the last word it stops and fires onComplete.
 */
export function useReaderEngine({ onComplete }: ReaderEngineOptions = {}): void {
  const isPlaying = useReaderStore((s) => s.isPlaying);
  const index = useReaderStore((s) => s.index);
  const wpm = useReaderStore((s) => s.wpm);
  const pauseOnPunctuation = useReaderStore((s) => s.pauseOnPunctuation);
  const tokens = useReaderStore((s) => s.tokens);
  const skip = useReaderStore((s) => s.skip);
  const pause = useReaderStore((s) => s.pause);

  useEffect(() => {
    if (!isPlaying || tokens.length === 0) {
      return;
    }

    const token = tokens[index] ?? '';
    const delay = intervalForToken(token, { wpm, pauseOnPunctuation });
    const atEnd = index >= tokens.length - 1;

    const timer = setTimeout(() => {
      if (atEnd) {
        pause();
        onComplete?.();
      } else {
        skip(1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, index, wpm, pauseOnPunctuation, tokens, skip, pause, onComplete]);
}
