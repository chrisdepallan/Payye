import axios, { AxiosError } from 'axios';

import { API_URL } from '../constants/config';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token (read fresh from the store on every request).
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 the token is stale/invalid — clear auth so the app returns to login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      void useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

/** Pull a human-readable message out of an axios error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
    if (error.code === 'ECONNABORTED') return 'Request timed out';
    if (error.message === 'Network Error') {
      return 'Cannot reach the server. Is the backend running?';
    }
  }
  return fallback;
}
