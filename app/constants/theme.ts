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

export const palettes: Record<'dark' | 'light', Palette> = {
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
