import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';
import { orpIndex } from '../utils/readerTiming';

interface WordDisplayProps {
  word: string;
  fontSize: number;
}

/**
 * Renders a single word with its Optimal Recognition Point letter highlighted,
 * flanked by focus guides — the classic RSVP (rapid serial visual) layout. The
 * highlight + guides can be turned off in settings for a plain-word display.
 */
export function WordDisplay({ word, fontSize }: WordDisplayProps) {
  const { palette } = useTheme();
  const highlight = useSettingsStore((s) => s.focus_highlight);

  if (!word) {
    return (
      <View style={styles.container}>
        <Text style={[styles.word, { fontSize, color: palette.textMuted }]}>—</Text>
      </View>
    );
  }

  if (!highlight) {
    return (
      <View style={styles.container}>
        <Text style={[styles.word, { fontSize, color: palette.text }]} numberOfLines={1}>
          {word}
        </Text>
      </View>
    );
  }

  const pivot = orpIndex(word);
  const before = word.slice(0, pivot);
  const focus = word.slice(pivot, pivot + 1);
  const after = word.slice(pivot + 1);

  return (
    <View style={styles.container}>
      <View style={[styles.tick, { backgroundColor: palette.accent }]} />
      <Text style={[styles.word, { fontSize, color: palette.text }]} numberOfLines={1}>
        <Text>{before}</Text>
        <Text style={{ color: palette.accent }}>{focus}</Text>
        <Text>{after}</Text>
      </Text>
      <View style={[styles.tick, { backgroundColor: palette.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 2,
    height: 14,
    opacity: 0.7,
  },
  word: {
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginVertical: 10,
  },
});
