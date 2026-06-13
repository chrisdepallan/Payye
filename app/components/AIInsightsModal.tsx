import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { radius, spacing } from '../constants/theme';
import { useKeywords, useSummary } from '../hooks/useAI';
import { useTheme } from '../hooks/useTheme';
import { getErrorMessage } from '../services/api';

interface AIInsightsModalProps {
  documentId: string;
  visible: boolean;
  onClose: () => void;
}

export function AIInsightsModal({ documentId, visible, onClose }: AIInsightsModalProps) {
  const { palette } = useTheme();
  const summary = useSummary(documentId, visible);
  const keywords = useKeywords(documentId, visible);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.text }]}>AI insights</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ color: palette.primary, fontWeight: '600' }}>Done</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.section, { color: palette.accent }]}>SUMMARY</Text>
            {summary.isLoading ? (
              <ActivityIndicator color={palette.primary} style={styles.loader} />
            ) : summary.isError ? (
              <Text style={{ color: palette.danger }}>{getErrorMessage(summary.error)}</Text>
            ) : (
              <Text style={[styles.body, { color: palette.text }]}>
                {summary.data?.summary}
              </Text>
            )}

            <Text style={[styles.section, { color: palette.accent }]}>
              KEYWORDS & DIFFICULTY
            </Text>
            {keywords.isLoading ? (
              <ActivityIndicator color={palette.primary} style={styles.loader} />
            ) : keywords.isError ? (
              <Text style={{ color: palette.danger }}>{getErrorMessage(keywords.error)}</Text>
            ) : (
              <>
                <View style={styles.chips}>
                  {keywords.data?.keywords.map((kw) => (
                    <View
                      key={kw}
                      style={[styles.chip, { backgroundColor: palette.surfaceAlt }]}
                    >
                      <Text style={{ color: palette.text }}>{kw}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.difficulty, { color: palette.textMuted }]}>
                  Difficulty: {keywords.data?.difficulty_level}
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  difficulty: {
    marginTop: spacing.md,
    fontSize: 14,
  },
});
