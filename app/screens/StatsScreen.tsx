import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import {
  Achievement,
  ACHIEVEMENTS,
  earnedAchievementIds,
} from '../constants/achievements';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/libraryStore';
import { useSessionsStore } from '../store/sessionsStore';
import { useStatsStore } from '../store/statsStore';
import { formatDuration } from '../utils/readerTiming';
import {
  aggregateStats,
  BookStat,
  computeStreak,
  formatCompactNumber,
  formatLongDuration,
} from '../utils/stats';

export function StatsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette } = useTheme();

  const documents = useLibraryStore((s) => s.documents);
  const sessions = useSessionsStore((s) => s.sessions);
  const dailyWords = useStatsStore((s) => s.dailyWords);
  const unlocked = useStatsStore((s) => s.unlocked);
  const syncAchievements = useStatsStore((s) => s.syncAchievements);

  const overall = useMemo(() => aggregateStats(documents, sessions), [documents, sessions]);
  const streak = useMemo(() => computeStreak(dailyWords), [dailyWords]);

  const earned = useMemo(
    () =>
      earnedAchievementIds({
        words: overall.totalWordsRead,
        books: overall.booksCompleted,
        minutes: overall.totalTimeMs / 60_000,
        streak,
        wpm: overall.maxWpm,
      }),
    [overall, streak],
  );

  // Persist unlock timestamps for anything newly earned the moment stats are viewed.
  const earnedKey = earned.join(',');
  useEffect(() => {
    syncAchievements(earned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedKey]);

  const earnedSet = useMemo(() => new Set(earned), [earned]);
  const startedBooks = overall.books.filter((b) => b.status !== 'new');

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: palette.text }]}>Your Progress</Text>

        <View style={styles.tileGrid}>
          <StatTile
            icon="text-outline"
            label="Words read"
            value={formatCompactNumber(overall.totalWordsRead)}
            tint={palette.primary}
          />
          <StatTile
            icon="time-outline"
            label="Time read"
            value={formatLongDuration(overall.totalTimeMs)}
            tint={palette.accent}
          />
          <StatTile
            icon="checkmark-done-outline"
            label="Books finished"
            value={`${overall.booksCompleted}`}
            tint={palette.success}
          />
          <StatTile
            icon="flame-outline"
            label="Day streak"
            value={`${streak}`}
            tint={palette.danger}
          />
        </View>

        <SectionHeading
          text={`Achievements · ${earned.length}/${ACHIEVEMENTS.length}`}
          color={palette.text}
        />
        <View style={styles.badgeGrid}>
          {ACHIEVEMENTS.map((a) => (
            <AchievementBadge
              key={a.id}
              achievement={a}
              earned={earnedSet.has(a.id)}
              unlockedAt={unlocked[a.id]}
            />
          ))}
        </View>

        <SectionHeading text="By book" color={palette.text} />
        {startedBooks.length === 0 ? (
          <Card>
            <Text style={{ color: palette.textMuted }}>
              No reading yet. Start a book and your stats will show up here.
            </Text>
          </Card>
        ) : (
          startedBooks.map((book) => (
            <BookProgressCard
              key={book.document.id}
              book={book}
              onPress={() =>
                navigation.navigate('Reader', { documentId: book.document.id })
              }
            />
          ))
        )}

        <Text style={[styles.note, { color: palette.textMuted }]}>
          All progress is stored only on this device.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function SectionHeading({ text, color }: { text: string; color: string }) {
  return <Text style={[styles.sectionHeading, { color }]}>{text}</Text>;
}

function StatTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[styles.tile, { backgroundColor: palette.surface, borderColor: palette.border }]}
    >
      <Ionicons name={icon} size={22} color={tint} />
      <Text style={[styles.tileValue, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: palette.textMuted }]}>{label}</Text>
    </View>
  );
}

function AchievementBadge({
  achievement,
  earned,
  unlockedAt,
}: {
  achievement: Achievement;
  earned: boolean;
  unlockedAt?: string;
}) {
  const { palette } = useTheme();
  const tint = earned ? palette.accent : palette.textMuted;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.surface,
          borderColor: earned ? palette.accent : palette.border,
          opacity: earned ? 1 : 0.55,
        },
      ]}
    >
      <Ionicons name={earned ? achievement.icon : 'lock-closed-outline'} size={24} color={tint} />
      <Text style={[styles.badgeTitle, { color: palette.text }]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={[styles.badgeDesc, { color: palette.textMuted }]} numberOfLines={2}>
        {achievement.description}
      </Text>
      {earned && unlockedAt ? (
        <Text style={[styles.badgeDate, { color: palette.success }]}>
          {new Date(unlockedAt).toLocaleDateString()}
        </Text>
      ) : null}
    </View>
  );
}

function BookProgressCard({ book, onPress }: { book: BookStat; onPress: () => void }) {
  const { palette } = useTheme();
  const percent = Math.round(book.percent * 100);
  const done = book.status === 'completed';
  return (
    <Card style={styles.bookCard} onPress={onPress}>
      <View style={styles.bookHeader}>
        <Text style={[styles.bookTitle, { color: palette.text }]} numberOfLines={1}>
          {book.document.title}
        </Text>
        {done ? (
          <Ionicons name="checkmark-circle" size={18} color={palette.success} />
        ) : null}
      </View>
      <View style={styles.bookProgress}>
        <ProgressBar progress={book.percent} />
      </View>
      <View style={styles.bookMetaRow}>
        <Text style={[styles.bookMeta, { color: palette.textMuted }]}>
          {percent}% · {book.wordsLeft.toLocaleString()} words left
        </Text>
        <Text style={[styles.bookMeta, { color: palette.textMuted }]}>
          {done ? 'Finished' : `~${formatDuration(book.estTimeLeftMs / 1000)} left`}
        </Text>
      </View>
      <View style={styles.bookMetaRow}>
        <Text style={[styles.bookMeta, { color: palette.textMuted }]}>
          {book.wordsRead.toLocaleString()} words read
        </Text>
        <Text style={[styles.bookMeta, { color: palette.textMuted }]}>
          {formatLongDuration(book.timeSpentMs)} spent
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tileValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  tileLabel: {
    fontSize: 13,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  badgeDate: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  bookCard: {
    marginBottom: spacing.sm,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  bookProgress: {
    marginBottom: spacing.sm,
  },
  bookMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  bookMeta: {
    fontSize: 12,
  },
  note: {
    marginTop: spacing.xl,
    fontSize: 13,
    textAlign: 'center',
  },
});
