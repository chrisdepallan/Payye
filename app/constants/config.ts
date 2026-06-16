import { Platform } from 'react-native';

/**
 * Base URL of the Payye AI backend (stateless — only AI + text extraction).
 *
 * Override with EXPO_PUBLIC_API_URL (e.g. in `app/.env`).
 *  - iOS simulator / web:   http://localhost:8000
 *  - Android emulator:      http://10.0.2.2:8000
 *  - Physical device:       http://<your-computer-LAN-IP>:8000
 */
const fallback = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallback ?? 'https://payye.vercel.app/api';

// Optional shared gateway token, sent as the X-App-Token header when set.
export const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN ?? null;

export const WPM_MIN = 60;
export const WPM_MAX = 1000;
export const WPM_STEP = 25;
export const WPM_PRESETS = [200, 300, 400, 500];

// --- Free-ebook sources (called directly from the device; no backend proxy) ---
export const GUTENDEX_URL = 'https://gutendex.com';
export const OPENLIBRARY_URL = 'https://openlibrary.org';
export const OPENLIBRARY_COVERS_URL = 'https://covers.openlibrary.org';
export const INTERNET_ARCHIVE_URL = 'https://archive.org';

// Cap fetched book text so the reader/AsyncStorage stay responsive on device
// (~170k words). The backend AI guard of 50k chars is unaffected by this.
export const MAX_BOOK_CHARS = 1_000_000;
