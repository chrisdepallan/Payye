import { MAX_BOOK_CHARS } from '../constants/config';

/**
 * Project Gutenberg plain-text files wrap the actual work in a license header
 * and footer. Drop everything before the "START OF THE PROJECT GUTENBERG EBOOK"
 * marker and after the matching "END OF ..." marker. If the markers aren't
 * present (rare / non-Gutenberg text), the text is returned unchanged.
 */
export function stripGutenbergBoilerplate(text: string): string {
  let body = text;

  const start = body.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/is);
  if (start && start.index !== undefined) {
    body = body.slice(start.index + start[0].length);
  }

  const end = body.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/is);
  if (end && end.index !== undefined) {
    body = body.slice(0, end.index);
  }

  return body.trim();
}

/**
 * Bound very large books so the reader and AsyncStorage stay responsive on
 * device. Mirrors the backend `/extract` trim.
 */
export function trimToLimit(text: string, max: number = MAX_BOOK_CHARS): string {
  return text.length > max ? text.slice(0, max) : text;
}
