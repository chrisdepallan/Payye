import { useQuery } from '@tanstack/react-query';

import { getKeywords, getSummary } from '../services/ai';

// Cached per document id; the text is sent to the stateless backend on fetch.
export function useSummary(documentId: string, text: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai', 'summary', documentId],
    queryFn: () => getSummary(text),
    enabled: enabled && !!text,
    staleTime: Infinity,
  });
}

export function useKeywords(documentId: string, text: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai', 'keywords', documentId],
    queryFn: () => getKeywords(text),
    enabled: enabled && !!text,
    staleTime: Infinity,
  });
}
