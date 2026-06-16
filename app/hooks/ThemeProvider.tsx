import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Easing } from 'react-native';

import { Palette, palettes, THEME_TRANSITION_MS, ThemeName } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

interface ThemeContextValue {
  palette: Palette;
  scheme: ThemeName;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// "#RRGGBB" (or "#RGB") -> [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? v.split('').map((c) => c + c).join('') : v;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Blend two hex colours, returning an "rgb(...)" string React Native accepts.
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function lerpPalette(from: Palette, to: Palette, t: number): Palette {
  if (t <= 0) return from;
  if (t >= 1) return to;
  const out = {} as Palette;
  (Object.keys(to) as (keyof Palette)[]).forEach((key) => {
    out[key] = mix(from[key], to[key], t);
  });
  return out;
}

/**
 * Holds the palette every screen renders with. When the chosen theme changes we
 * crossfade each colour from the current palette to the new one over a few
 * frames instead of swapping instantly — so flipping from light to dark dims
 * gently rather than flashbanging the screen. Because every component reads its
 * colours from {@link useTheme}, they all transition together for free.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const targetScheme = useSettingsStore((s) => s.theme);
  const animate = useSettingsStore((s) => s.theme_transitions);

  // The palette actually on screen — a blend of two palettes while transitioning.
  const [palette, setPalette] = useState<Palette>(() => palettes[targetScheme]);
  // Scheme reported to chrome that switches on it (status bar, navigation base).
  const [scheme, setScheme] = useState<ThemeName>(targetScheme);

  const progress = useRef(new Animated.Value(1)).current;
  // The palette currently shown, captured when a transition begins.
  const displayedRef = useRef<Palette>(palettes[targetScheme]);
  const firstRun = useRef(true);

  // Keep a live reference to what's on screen so a transition can start from a
  // mid-fade colour if the user toggles again before the previous fade ends.
  displayedRef.current = palette;

  useEffect(() => {
    const to = palettes[targetScheme];

    // Don't animate the initial mount — just adopt the saved theme.
    if (firstRun.current) {
      firstRun.current = false;
      setPalette(to);
      setScheme(targetScheme);
      return;
    }

    if (!animate) {
      setPalette(to);
      setScheme(targetScheme);
      return;
    }

    const from = displayedRef.current;
    progress.setValue(0);

    const id = progress.addListener(({ value }) => {
      setPalette(lerpPalette(from, to, value));
      // Flip status-bar/nav chrome at the midpoint, when the background is
      // roughly neutral, so it doesn't invert against the old colours.
      if (value >= 0.5) setScheme(targetScheme);
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: THEME_TRANSITION_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      // A new transition interrupting this one fires this with finished=false;
      // let that newer animation own the palette instead of snapping back.
      if (!finished) return;
      progress.removeListener(id);
      setPalette(to);
      setScheme(targetScheme);
    });

    return () => {
      progress.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetScheme, animate]);

  return (
    <ThemeContext.Provider value={{ palette, scheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
