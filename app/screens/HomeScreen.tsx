import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { extractFile } from '../services/extract';
import { useLibraryStore } from '../store/libraryStore';
import { selectCurrentSession, useSessionsStore } from '../store/sessionsStore';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette } = useTheme();

  const documents = useLibraryStore((s) => s.documents);
  const addDocument = useLibraryStore((s) => s.add);
  const sessions = useSessionsStore((s) => s.sessions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(() => selectCurrentSession(sessions), [sessions]);
  const currentDoc = useMemo(
    () => (current ? documents.find((d) => d.id === current.documentId) : undefined),
    [current, documents],
  );

  const progress =
    current && currentDoc && currentDoc.word_count > 0
      ? current.current_word_index / currentDoc.word_count
      : 0;

  const onUpload = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }
    const asset = result.assets[0];
    setBusy(true);
    try {
      const extracted = await extractFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      const title = asset.name.replace(/\.[^.]+$/, '');
      const doc = addDocument({
        title,
        text: extracted.text,
        sourceType: extracted.source_type,
      });
      navigation.navigate('Reader', { documentId: doc.id });
    } catch (e) {
      setError(getErrorMessage(e, 'Upload failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.greeting, { color: palette.text }]}>Payye</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Read faster, one word at a time.
        </Text>

        {current && currentDoc ? (
          <Card
            style={styles.continueCard}
            onPress={() => navigation.navigate('Reader', { documentId: currentDoc.id })}
          >
            <Text style={[styles.cardLabel, { color: palette.accent }]}>CONTINUE READING</Text>
            <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
              {currentDoc.title}
            </Text>
            <View style={styles.progressRow}>
              <ProgressBar progress={progress} />
            </View>
            <Text style={[styles.progressText, { color: palette.textMuted }]}>
              {Math.round(progress * 100)}% · word {current.current_word_index + 1} of{' '}
              {currentDoc.word_count}
            </Text>
          </Card>
        ) : (
          <Card style={styles.continueCard}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>No active session</Text>
            <Text style={{ color: palette.textMuted, marginTop: spacing.xs }}>
              Paste some text or upload a document to start reading.
            </Text>
          </Card>
        )}

        {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button title="＋  New session (paste text)" onPress={() => navigation.navigate('NewSession')} />
          <Button title="⬆  Upload TXT or PDF" variant="secondary" loading={busy} onPress={onUpload} />
          <Button
            title="Browse library"
            variant="ghost"
            onPress={() => navigation.navigate('Tabs', { screen: 'Library' })}
          />
        </View>

        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={18} color={palette.accent} />
          <Text style={[styles.tip, { color: palette.textMuted }]}>
            Everything stays on this device — the server is only used for AI features.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 34,
    fontWeight: '800',
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: spacing.xs,
  },
  continueCard: {
    marginTop: spacing.lg,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  progressRow: {
    marginTop: spacing.md,
  },
  progressText: {
    marginTop: spacing.sm,
    fontSize: 13,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  tip: {
    flex: 1,
    fontSize: 13,
  },
});
