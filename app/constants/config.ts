import { Platform } from 'react-native';

/**
 * Base URL of the Payye backend.
 *
 * Override per environment with EXPO_PUBLIC_API_URL (e.g. in `app/.env`).
 * On a physical device use your computer's LAN IP, e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000
 */
const fallback = Platform.select({
  // Android emulator reaches the host machine via 10.0.2.2.
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallback ?? 'http://localhost:8000';

export const WPM_MIN = 60;
export const WPM_MAX = 1000;
export const WPM_STEP = 25;
export const WPM_PRESETS = [200, 300, 400, 500];
