import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getCurrentSession,
  getSessionHistory,
  SessionUpdatePayload,
  startSession,
  updateSession,
} from '../services/sessions';
import { useAuthStore } from '../store/authStore';

export const sessionKeys = {
  current: ['sessions', 'current'] as const,
  history: ['sessions', 'history'] as const,
};

export function useCurrentSession() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: sessionKeys.current,
    queryFn: getCurrentSession,
    enabled: !!token,
  });
}

export function useSessionHistory() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: sessionKeys.history,
    queryFn: getSessionHistory,
    enabled: !!token,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, wpm }: { documentId: string; wpm?: number }) =>
      startSession(documentId, wpm),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SessionUpdatePayload }) =>
      updateSession(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
