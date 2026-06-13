import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSettings, updateSettings } from '../services/settingsApi';
import { useAuthStore } from '../store/authStore';
import { UserSettings } from '../types';

const SETTINGS_KEY = ['settings'];

export function useSettings() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserSettings>) => updateSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
  });
}
