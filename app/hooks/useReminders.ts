import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  cancelDailyReminder,
  configureNotifications,
  ensurePermissions,
  rescheduleDailyReminder,
} from '../services/notifications';
import { useLibraryStore } from '../store/libraryStore';
import { selectCurrentSession, useSessionsStore } from '../store/sessionsStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { computeStreak } from '../utils/stats';

/** Snapshot the on-device reading state the reminder message is built from. */
function buildReminderInput() {
  const { reminders_enabled, reminder_hour, reminder_minute } =
    useSettingsStore.getState();
  const current = selectCurrentSession(useSessionsStore.getState().sessions);
  const resumeTitle = current
    ? useLibraryStore.getState().documents.find((d) => d.id === current.documentId)?.title
    : undefined;
  return {
    enabled: reminders_enabled,
    hour: reminder_hour,
    minute: reminder_minute,
    streak: computeStreak(useStatsStore.getState().dailyWords),
    resumeTitle,
  };
}

/**
 * Keeps the local daily reading reminder in sync with the user's settings and
 * latest reading state. Mounted once near the app root. No backend involved —
 * everything is scheduled on-device.
 */
export function useReminders(): void {
  const enabled = useSettingsStore((s) => s.reminders_enabled);
  const hour = useSettingsStore((s) => s.reminder_hour);
  const minute = useSettingsStore((s) => s.reminder_minute);

  // One-time foreground handler + Android channel setup.
  useEffect(() => {
    configureNotifications();
  }, []);

  // Re-sync the schedule whenever the reminder settings change.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!enabled) {
        await cancelDailyReminder();
        return;
      }
      const granted = await ensurePermissions();
      if (cancelled || !granted) return;
      await rescheduleDailyReminder(buildReminderInput());
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, hour, minute]);

  // Refresh the message with the latest streak/session when the app backgrounds.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      const input = buildReminderInput();
      if (input.enabled) rescheduleDailyReminder(input);
    });
    return () => sub.remove();
  }, []);
}
