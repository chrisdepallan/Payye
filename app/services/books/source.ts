import { BookSearchOptions, BookSearchPage, BookSource, BookText } from '../../types';

/**
 * Runtime contract for a free-ebook source. Extends the UI-facing `BookSource`
 * metadata with the fetch operations. Add a new source by implementing this and
 * registering it in `index.ts`.
 */
export interface SourceProvider extends BookSource {
  search(query: string, opts: BookSearchOptions): Promise<BookSearchPage>;
  fetchText(id: string): Promise<BookText>;
}
