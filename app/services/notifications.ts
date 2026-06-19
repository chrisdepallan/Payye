/**
 * Local (on-device) reading reminders.
 *
 * Everything here schedules notifications on the device itself via
 * `expo-notifications` — there is no server, no push token, and no backend call.
 * The reminder body is personalised from on-device state (reading streak +
 * current session) that the caller passes in, keeping the backend stateless.
 *
 * Note: local notifications only fire reliably in a dev/standalone build, not in
 * Expo Go (SDK 53+ dropped Expo Go push support).
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/** Stable id so each reschedule replaces the previous reminder instead of stacking. */
const REMINDER_ID = 'payye.daily-reading-reminder';
const ANDROID_CHANNEL_ID = 'reminders';

let configured = false;

/** Foreground handler + Android channel. Safe to call more than once. */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Reading reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** Ask for (or read existing) notification permission. Returns whether granted. */
export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

interface ReminderInput {
  enabled: boolean;
  hour: number;
  minute: number;
  /** Current reading streak in days (0 if none today/recently). */
  streak: number;
  /** Title of the most recent unfinished book, if any. */
  resumeTitle?: string;
}

/** Pick a reminder message from current on-device reading state. */
function buildBody({ streak, resumeTitle }: ReminderInput): string {
  if (streak >= 2) return `Don't break your ${streak}-day streak! 📚`;
  if (resumeTitle) return `Pick up where you left off in ${resumeTitle}.`;
  return 'Time for today’s read on Payye 📖';
}

/**
 * Cancel the existing reminder and, when enabled, schedule a fresh daily one with
 * an up-to-date message. Call this whenever the reminder settings change or the
 * app is backgrounded so the body reflects the latest streak/session.
 */
export async function rescheduleDailyReminder(input: ReminderInput): Promise<void> {
  await cancelDailyReminder();
  if (!input.enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Payye',
      body: buildBody(input),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: input.hour,
      minute: input.minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // No existing reminder scheduled — nothing to cancel.
  }
}
