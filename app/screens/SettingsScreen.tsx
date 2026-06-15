import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SpeedControls } from '../components/SpeedControls';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsScreen() {
  const { palette } = useTheme();
  const settings = useSettingsStore();
  const { update } = settings;
  const fontSize = settings.font_size;

  return (
    <Screen>
      <Text style={[styles.heading, { color: palette.text }]}>Settings</Text>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: palette.textMuted }]}>THEME</Text>
        <View style={styles.themeRow}>
          {(['dark', 'light'] as const).map((option) => {
            const active = settings.theme === option;
            return (
              <Pressable
                key={option}
                onPress={() => update({ theme: option })}
                style={[
                  styles.themeChip,
                  {
                    borderColor: active ? palette.primary : palette.border,
                    backgroundColor: active ? palette.primary : 'transparent',
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? palette.primaryText : palette.text,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: palette.textMuted }]}>DEFAULT SPEED</Text>
        <View style={{ marginTop: spacing.sm }}>
          <SpeedControls
            wpm={settings.default_wpm}
            onChange={(value) => update({ default_wpm: value })}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.inlineRow}>
          <Text style={[styles.value, { color: palette.text }]}>Font size</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => update({ font_size: Math.max(fontSize - 4, 24) })}
              style={[styles.stepButton, { backgroundColor: palette.surfaceAlt }]}
            >
              <Text style={[styles.stepLabel, { color: palette.text }]}>A−</Text>
            </Pressable>
            <Text style={[styles.value, { color: palette.text, minWidth: 36, textAlign: 'center' }]}>
              {fontSize}
            </Text>
            <Pressable
              onPress={() => update({ font_size: Math.min(fontSize + 4, 120) })}
              style={[styles.stepButton, { backgroundColor: palette.surfaceAlt }]}
            >
              <Text style={[styles.stepLabel, { color: palette.text }]}>A+</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.inlineRow, { marginTop: spacing.md }]}>
          <Text style={[styles.value, { color: palette.text }]}>Pause on punctuation</Text>
          <Switch
            value={settings.pause_on_punctuation}
            onValueChange={(value) => update({ pause_on_punctuation: value })}
            trackColor={{ true: palette.primary, false: palette.border }}
          />
        </View>
      </Card>

      <Text style={[styles.note, { color: palette.textMuted }]}>
        Your documents, progress and settings are stored only on this device.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  themeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 44,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    marginTop: spacing.sm,
    fontSize: 13,
    textAlign: 'center',
  },
});
