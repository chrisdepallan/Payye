import { useMutation } from '@tanstack/react-query';

import * as authService from '../services/auth';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async (data) => {
      await setAuth(data.access_token, data.user);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (vars: { name: string; email: string; password: string }) =>
      authService.register(vars.name, vars.email, vars.password),
    onSuccess: async (data) => {
      await setAuth(data.access_token, data.user);
    },
  });
}
