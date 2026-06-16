import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AIInsightsModal } from '../components/AIInsightsModal';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { SpeedControls } from '../components/SpeedControls';
import { WordDisplay } from '../components/WordDisplay';
import { spacing } from '../constants/theme';
import { useReaderEngine } from '../hooks/useReaderEngine';
import { useTheme } from '../hooks/useTheme';
import { RootStackScreenProps } from '../navigation/types';
import { useLibraryStore } from '../store/libraryStore';
import { useReaderStore } from '../store/readerStore';
import { useSessionsStore } from '../store/sessionsStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStatsStore } from '../store/statsStore';
import { SessionStatus } from '../types';
import { estimateMinutesRemaining, formatDuration } from '../utils/readerTiming';
import { formatLongDuration } from '../utils/stats';

const SAVE_EVERY_WORDS = 25;

export function ReaderScreen({ route, navigation }: RootStackScreenProps<'Reader'>) {
  const { documentId } = route.params;
  const { palette } = useTheme();

  const doc = useLibraryStore((s) => s.documents.find((d) => d.id === documentId));
  const fontSize = useSettingsStore((s) => s.font_size);
  const defaultWpm = useSettingsStore((s) => s.default_wpm);
  const pauseOnPunctuation = useSettingsStore((s) => s.pause_on_punctuation);
  const longWordSlowdown = useSettingsStore((s) => s.long_word_slowdown);
  const upsertSession = useSessionsStore((s) => s.upsert);
  const accumulateSession = useSessionsStore((s) => s.accumulate);
  const recordReading = useStatsStore((s) => s.recordReading);
  const timeSpentMs = useSessionsStore((s) => s.sessions[documentId]?.time_spent_ms ?? 0);
  const wordsRead = useSessionsStore((s) => s.sessions[documentId]?.words_read ?? 0);

  const load = useReaderStore((s) => s.load);
  const tokens = useReaderStore((s) => s.tokens);
  const index = useReaderStore((s) => s.index);
  const isPlaying = useReaderStore((s) => s.isPlaying);
  const wpm = useReaderStore((s) => s.wpm);
  const toggle = useReaderStore((s) => s.toggle);
  const skip = useReaderStore((s) => s.skip);
  const setIndex = useReaderStore((s) => s.setIndex);
  const setWpm = useReaderStore((s) => s.setWpm);

  const [focusMode, setFocusMode] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const loadedRef = useRef(false);
  const lastSavedRef = useRef(0);
  const completedRef = useRef(false);

  // Active-reading segment: wall-clock start + index when the current play run began.
  const segStartTimeRef = useRef<number | null>(null);
  const segStartIndexRef = useRef(0);

  // Fold the elapsed time + words advanced of the current play segment into the
  // session totals (and today's word bucket), then end the segment.
  const flushActivity = useCallback(() => {
    if (segStartTimeRef.current == null) return;
    const elapsed = Date.now() - segStartTimeRef.current;
    const wordsAdvanced = Math.max(
      0,
      useReaderStore.getState().index - segStartIndexRef.current,
    );
    segStartTimeRef.current = null;
    accumulateSession(documentId, { wordsRead: wordsAdvanced, timeMs: elapsed });
    recordReading(wordsAdvanced);
  }, [documentId, accumulateSession, recordReading]);

  const startSegment = useCallback(() => {
    segStartTimeRef.current = Date.now();
    segStartIndexRef.current = useReaderStore.getState().index;
  }, []);

  const total = tokens.length;
  const atEnd = total > 0 && index >= total - 1 && !isPlaying;
  const progress = total > 0 ? (index + 1) / total : 0;

  const persistProgress = useCallback(
    (status: SessionStatus) => {
      const state = useReaderStore.getState();
      lastSavedRef.current = state.index;
      upsertSession(documentId, {
        current_word_index: state.index,
        wpm: state.wpm,
        status,
      });
    },
    [documentId, upsertSession],
  );

  // Load the reader once the document is available.
  useEffect(() => {
    if (loadedRef.current || !doc) return;
    loadedRef.current = true;
    const record = useSessionsStore.getState().sessions[documentId];
    const startIndex = record?.current_word_index ?? 0;
    const startWpm = record?.wpm ?? defaultWpm;
    lastSavedRef.current = startIndex;
    load({
      sessionId: documentId,
      documentId,
      title: doc.title,
      text: doc.text_content,
      startIndex,
      wpm: startWpm,
      pauseOnPunctuation,
      longWordSlowdown,
    });
    upsertSession(documentId, {
      current_word_index: startIndex,
      wpm: startWpm,
      status: 'active',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const onComplete = useCallback(() => {
    completedRef.current = true;
    persistProgress('completed');
  }, [persistProgress]);

  useReaderEngine({ onComplete });

  // Track active reading time: open a segment on play, close (and bank) it on pause.
  useEffect(() => {
    if (isPlaying) {
      startSegment();
    } else {
      flushActivity();
    }
  }, [isPlaying, startSegment, flushActivity]);

  // Periodically save progress + bank reading time while playing.
  useEffect(() => {
    if (!isPlaying) return;
    if (Math.abs(index - lastSavedRef.current) >= SAVE_EVERY_WORDS) {
      persistProgress('active');
      flushActivity();
      startSegment();
    }
  }, [index, isPlaying, persistProgress, flushActivity, startSegment]);

  // Save the last position + bank any in-flight reading time when leaving.
  useEffect(() => {
    return () => {
      flushActivity();
      if (completedRef.current) return;
      const state = useReaderStore.getState();
      if (state.documentId) {
        upsertSession(state.documentId, {
          current_word_index: state.index,
          wpm: state.wpm,
          status: 'paused',
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    const wasPlaying = useReaderStore.getState().isPlaying;
    completedRef.current = false;
    toggle();
    if (wasPlaying) persistProgress('paused');
  };

  const handleRestart = () => {
    completedRef.current = false;
    setIndex(0);
    persistProgress('active');
  };

  if (!doc) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={{ color: palette.danger }}>Document not found.</Text>
        </View>
      </Screen>
    );
  }

  const minutesRemaining = estimateMinutesRemaining(total - index, wpm);

  return (
    <Screen padded={false}>
      {!focusMode ? (
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={palette.text} />
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
            {doc.title}
          </Text>
          <View style={styles.topActions}>
            <Pressable onPress={() => setShowAI(true)} hitSlop={10}>
              <Ionicons name="sparkles-outline" size={22} color={palette.accent} />
            </Pressable>
            <Pressable onPress={() => setFocusMode(true)} hitSlop={10}>
              <Ionicons name="contract-outline" size={22} color={palette.text} />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.exitFocus} onPress={() => setFocusMode(false)} hitSlop={10}>
          <Ionicons name="expand-outline" size={22} color={palette.textMuted} />
        </Pressable>
      )}

      <Pressable style={styles.stage} onPress={handleToggle}>
        <WordDisplay word={tokens[index] ?? ''} fontSize={fontSize} />
        {atEnd ? (
          <Text style={[styles.doneHint, { color: palette.success }]}>
            Finished — tap restart below
          </Text>
        ) : (
          <Text style={[styles.tapHint, { color: palette.textMuted }]}>
            {isPlaying ? 'tap to pause' : 'tap to play'}
          </Text>
        )}
      </Pressable>

      {!focusMode ? (
        <View style={styles.bottom}>
          <ProgressBar progress={progress} />
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: palette.textMuted }]}>
              {total > 0 ? `${index + 1} / ${total} words` : 'No words'}
            </Text>
            <Text style={[styles.meta, { color: palette.textMuted }]}>
              ~{formatDuration(minutesRemaining * 60)} left
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: palette.textMuted }]}>
              {`${Math.round(progress * 100)}% · ${wordsRead.toLocaleString()} words read`}
            </Text>
            <Text style={[styles.meta, { color: palette.textMuted }]}>
              {formatLongDuration(timeSpentMs)} spent
            </Text>
          </View>

          <View style={styles.transport}>
            <TransportButton icon="play-back" onPress={() => skip(-10)} color={palette.text} />
            <TransportButton icon="chevron-back" onPress={() => skip(-1)} color={palette.text} />
            {atEnd ? (
              <Pressable
                onPress={handleRestart}
                style={[styles.playButton, { backgroundColor: palette.success }]}
              >
                <Ionicons name="refresh" size={30} color={palette.primaryText} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleToggle}
                style={[styles.playButton, { backgroundColor: palette.primary }]}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={30}
                  color={palette.primaryText}
                />
              </Pressable>
            )}
            <TransportButton icon="chevron-forward" onPress={() => skip(1)} color={palette.text} />
            <TransportButton icon="play-forward" onPress={() => skip(10)} color={palette.text} />
          </View>

          <View style={styles.speed}>
            <SpeedControls wpm={wpm} onChange={setWpm} />
          </View>
        </View>
      ) : null}

      <AIInsightsModal
        documentId={documentId}
        text={doc.text_content}
        visible={showAI}
        onClose={() => setShowAI(false)}
      />
    </Screen>
  );
}

function TransportButton({
  icon,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.transportButton}>
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exitFocus: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  tapHint: {
    marginTop: spacing.xl,
    fontSize: 13,
  },
  doneHint: {
    marginTop: spacing.xl,
    fontSize: 14,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 13,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  transportButton: {
    padding: spacing.sm,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speed: {
    marginTop: spacing.lg,
  },
});
