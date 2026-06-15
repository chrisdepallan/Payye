export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
  danger: string;
  success: string;
}

export type ThemeName = 'dark' | 'light' | 'black';

export const palettes: Record<ThemeName, Palette> = {
  dark: {
    background: '#0E1116',
    surface: '#181D26',
    surfaceAlt: '#222936',
    text: '#F5F7FA',
    textMuted: '#9AA4B2',
    primary: '#4F8CFF',
    primaryText: '#FFFFFF',
    accent: '#FFB454',
    border: '#2A3140',
    danger: '#FF6B6B',
    success: '#3DD68C',
  },
  light: {
    background: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF2F8',
    text: '#12161C',
    textMuted: '#5B6573',
    primary: '#2F6BFF',
    primaryText: '#FFFFFF',
    accent: '#E08600',
    border: '#DCE3EC',
    danger: '#D64545',
    success: '#1FA971',
  },
  // True-black / AMOLED. Pure #000000 background switches OLED pixels off,
  // saving battery on most Android phones. Surfaces are near-black so cards
  // still read as slightly elevated against the void.
  black: {
    background: '#000000',
    surface: '#0A0A0C',
    surfaceAlt: '#15161A',
    text: '#F5F7FA',
    textMuted: '#8A93A0',
    primary: '#4F8CFF',
    primaryText: '#FFFFFF',
    accent: '#FFB454',
    border: '#1A1D24',
    danger: '#FF6B6B',
    success: '#3DD68C',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};
