import { Palette, ThemeName } from '../constants/theme';
import { useThemeContext } from './ThemeProvider';

export function useTheme(): { palette: Palette; scheme: ThemeName } {
  return useThemeContext();
}
