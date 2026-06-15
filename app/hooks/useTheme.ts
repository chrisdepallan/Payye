import { Palette, palettes, ThemeName } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme(): { palette: Palette; scheme: ThemeName } {
  const scheme = useSettingsStore((s) => s.theme);
  return { palette: palettes[scheme], scheme };
}
