import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SpeedControls } from '../components/SpeedControls';
import { radius, spacing } from '../constants/theme';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';

export function SettingsScreen() {
  const { palette } = useTheme();
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const fontSize = settings?.font_size ?? 48;

  if (isLoading || !settings) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={[styles.heading, { color: palette.text }]}>Settings</Text>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: palette.textMuted }]}>SIGNED IN AS</Text>
        <Text style={[styles.value, { color: palette.text }]}>{user?.name}</Text>
        <Text style={{ color: palette.textMuted }}>{user?.email}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: palette.textMuted }]}>THEME</Text>
        <View style={styles.themeRow}>
          {(['dark', 'light'] as const).map((option) => {
            const active = settings.theme === option;
            return (
              <Pressable
                key={option}
                onPress={() => update.mutate({ theme: option })}
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
            onChange={(value) => update.mutate({ default_wpm: value })}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.inlineRow}>
          <Text style={[styles.value, { color: palette.text }]}>Font size</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => update.mutate({ font_size: Math.max(fontSize - 4, 24) })}
              style={[styles.stepButton, { backgroundColor: palette.surfaceAlt }]}
            >
              <Text style={[styles.stepLabel, { color: palette.text }]}>A−</Text>
            </Pressable>
            <Text style={[styles.value, { color: palette.text, minWidth: 36, textAlign: 'center' }]}>
              {fontSize}
            </Text>
            <Pressable
              onPress={() => update.mutate({ font_size: Math.min(fontSize + 4, 120) })}
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
            onValueChange={(value) => update.mutate({ pause_on_punctuation: value })}
            trackColor={{ true: palette.primary, false: palette.border }}
          />
        </View>
      </Card>

      <Button title="Log out" variant="danger" onPress={() => void logout()} style={styles.logout} />
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
  logout: {
    marginTop: spacing.sm,
  },
});
