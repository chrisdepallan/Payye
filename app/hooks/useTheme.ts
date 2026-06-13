import { Palette, palettes } from '../constants/theme';
import { useSettings } from './useSettings';

export function useTheme(): { palette: Palette; scheme: 'dark' | 'light' } {
  const { data } = useSettings();
  const scheme = data?.theme ?? 'dark';
  return { palette: palettes[scheme], scheme };
}
