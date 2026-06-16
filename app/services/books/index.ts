import { BookSearchOptions, BookSearchPage, BookSource, BookText } from '../../types';
import { gutenberg } from './gutenberg';
import { openLibrary } from './openLibrary';
import { SourceProvider } from './source';

const PROVIDERS: SourceProvider[] = [gutenberg, openLibrary];

/** UI-facing source metadata (no fetch functions leaked into render state). */
export const SOURCES: BookSource[] = PROVIDERS.map(
  ({ id, name, supportsLanguage, supportsTopic }) => ({
    id,
    name,
    supportsLanguage,
    supportsTopic,
  }),
);

function getProvider(sourceId: string): SourceProvider {
  const provider = PROVIDERS.find((p) => p.id === sourceId);
  if (!provider) throw new Error(`Unknown book source: ${sourceId}`);
  return provider;
}

export function searchBooks(
  sourceId: string,
  query: string,
  opts: BookSearchOptions = {},
): Promise<BookSearchPage> {
  return getProvider(sourceId).search(query, opts);
}

export function fetchBookText(sourceId: string, id: string): Promise<BookText> {
  return getProvider(sourceId).fetchText(id);
}
