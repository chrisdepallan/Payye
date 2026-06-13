import React from 'react';
import { StyleSheet, View } from 'react-native';

import { radius } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0..1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View style={[styles.track, { backgroundColor: palette.surfaceAlt }]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: palette.primary, width: `${clamped * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
