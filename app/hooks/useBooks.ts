import { useInfiniteQuery } from '@tanstack/react-query';

import { searchBooks } from '../services/books';
import { BookSearchOptions, BookSearchPage } from '../types';

type Filters = Pick<BookSearchOptions, 'language' | 'topic'>;

/**
 * Paginated ebook search for a given source. Disabled until there's a query.
 * Pages accumulate via React Query's infinite query; `nextPage` drives loading.
 */
export function useBookSearch(sourceId: string, query: string, filters: Filters = {}) {
  const trimmed = query.trim();
  const topic = filters.topic?.trim() ?? '';
  return useInfiniteQuery<BookSearchPage>({
    queryKey: ['books', sourceId, trimmed, filters.language ?? '', topic],
    queryFn: ({ pageParam }) =>
      searchBooks(sourceId, trimmed, { ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // A query term OR a topic is enough to search (both sources allow browsing
    // by topic alone); language on its own is too broad.
    enabled: trimmed.length > 0 || topic.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
