/**
 * Split text into display tokens. Whitespace-split keeps trailing punctuation
 * attached to its word so the reader can vary the hold time per token.
 * Mirrors the backend tokenizer so word indices line up across client/server.
 */
export function tokenize(text: string): string[] {
  if (!text) {
    return [];
  }
  return text.trim().split(/\s+/).filter(Boolean);
}

export function countWords(text: string): number {
  return tokenize(text).length;
}
