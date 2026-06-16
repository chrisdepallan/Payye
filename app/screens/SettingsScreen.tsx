import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SpeedControls } from '../components/SpeedControls';
import { radius, spacing, ThemeName } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';

const THEME_ICONS: Record<ThemeName, keyof typeof Ionicons.glyphMap> = {
  dark: 'moon',
  light: 'sunny',
  black: 'battery-charging',
};

export function SettingsScreen() {
  const { palette } = useTheme();
  const settings = useSettingsStore();
  const { update } = settings;
  const fontSize = settings.font_size;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: palette.text }]}>Settings</Text>

        <Text style={[styles.section, { color: palette.textMuted }]}>APPEARANCE</Text>

        <Card style={styles.card}>
          <Text style={[styles.label, { color: palette.textMuted }]}>THEME</Text>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'black'] as const).map((option) => {
              const active = settings.theme === option;
              // The black/AMOLED option always shows its green symbol so it reads
              // as the battery-saving choice even when not selected.
              const symbolColor =
                option === 'black'
                  ? palette.success
                  : active
                    ? palette.primaryText
                    : palette.text;
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
                  <Ionicons name={THEME_ICONS[option]} size={16} color={symbolColor} />
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

          <Divider />

          <ToggleRow
            title="Smooth theme transitions"
            subtitle="Fade between themes instead of an instant flash"
            value={settings.theme_transitions}
            onValueChange={(value) => update({ theme_transitions: value })}
          />
        </Card>

        <Text style={[styles.section, { color: palette.textMuted }]}>READING</Text>

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
              <Text
                style={[styles.value, { color: palette.text, minWidth: 36, textAlign: 'center' }]}
              >
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

          <Divider />

          <ToggleRow
            title="Pause on punctuation"
            subtitle="Linger on commas and full stops"
            value={settings.pause_on_punctuation}
            onValueChange={(value) => update({ pause_on_punctuation: value })}
          />

          <Divider />

          <ToggleRow
            title="Slow down long words"
            subtitle="Hold longer words on screen a little longer"
            value={settings.long_word_slowdown}
            onValueChange={(value) => update({ long_word_slowdown: value })}
          />

          <Divider />

          <ToggleRow
            title="Focus letter highlight"
            subtitle="Tint the pivot letter and show focus guides"
            value={settings.focus_highlight}
            onValueChange={(value) => update({ focus_highlight: value })}
          />
        </Card>

        <Text style={[styles.note, { color: palette.textMuted }]}>
          Your documents, progress and settings are stored only on this device.
        </Text>
      </ScrollView>
    </Screen>
  );
}

interface ToggleRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function Divider() {
  const { palette } = useTheme();
  return <View style={[styles.divider, { backgroundColor: palette.border }]} />;
}

function ToggleRow({ title, subtitle, value, onValueChange }: ToggleRowProps) {
  const { palette } = useTheme();
  return (
    <View style={styles.inlineRow}>
      <View style={styles.toggleText}>
        <Text style={[styles.value, { color: palette.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: palette.primary, false: palette.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.lg,
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
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
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
