import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WPM_MAX, WPM_MIN, WPM_PRESETS, WPM_STEP } from '../constants/config';
import { Palette, radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface SpeedControlsProps {
  wpm: number;
  onChange: (wpm: number) => void;
}

function clampWpm(value: number): number {
  return Math.max(WPM_MIN, Math.min(value, WPM_MAX));
}

function RoundButton({
  label,
  onPress,
  palette,
}: {
  label: string;
  onPress: () => void;
  palette: Palette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: palette.surfaceAlt, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.roundLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

export function SpeedControls({ wpm, onChange }: SpeedControlsProps) {
  const { palette } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <RoundButton label="−" palette={palette} onPress={() => onChange(clampWpm(wpm - WPM_STEP))} />
        <View style={styles.center}>
          <Text style={[styles.value, { color: palette.text }]}>{wpm}</Text>
          <Text style={[styles.unit, { color: palette.textMuted }]}>words / min</Text>
        </View>
        <RoundButton label="+" palette={palette} onPress={() => onChange(clampWpm(wpm + WPM_STEP))} />
      </View>
      <View style={styles.presets}>
        {WPM_PRESETS.map((preset) => {
          const active = preset === wpm;
          return (
            <Pressable
              key={preset}
              onPress={() => onChange(preset)}
              style={[
                styles.chip,
                {
                  borderColor: active ? palette.primary : palette.border,
                  backgroundColor: active ? palette.primary : 'transparent',
                },
              ]}
            >
              <Text
                style={{
                  color: active ? palette.primaryText : palette.textMuted,
                  fontWeight: '600',
                }}
              >
                {preset}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundLabel: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  center: {
    minWidth: 110,
    alignItems: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
  },
  unit: {
    fontSize: 12,
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
