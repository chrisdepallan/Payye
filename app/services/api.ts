import axios from 'axios';

import { API_URL, APP_TOKEN } from '../constants/config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Optional shared gateway token (protects the backend's OpenAI quota).
if (APP_TOKEN) {
  api.defaults.headers.common['X-App-Token'] = APP_TOKEN;
}

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
      return 'Cannot reach the AI server. Is the backend running?';
    }
  }
  // Plain thrown errors (e.g. friendly messages from the ebook sources).
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
