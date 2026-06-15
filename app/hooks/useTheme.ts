import { Palette, palettes } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme(): { palette: Palette; scheme: 'dark' | 'light' } {
  const scheme = useSettingsStore((s) => s.theme);
  return { palette: palettes[scheme], scheme };
}
