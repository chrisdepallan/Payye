import { useQuery } from '@tanstack/react-query';

import { getKeywords, getSummary } from '../services/ai';

export function useSummary(documentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai', 'summary', documentId],
    queryFn: () => getSummary(documentId),
    enabled,
    staleTime: Infinity,
  });
}

export function useKeywords(documentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ai', 'keywords', documentId],
    queryFn: () => getKeywords(documentId),
    enabled,
    staleTime: Infinity,
  });
}
