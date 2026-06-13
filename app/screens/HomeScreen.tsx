import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { useUploadDocument } from '../hooks/useDocuments';
import { useCurrentSession } from '../hooks/useSessions';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { data: current, isLoading } = useCurrentSession();
  const upload = useUploadDocument();
  const [error, setError] = useState<string | null>(null);

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
    upload.mutate(
      { uri: asset.uri, name: asset.name, mimeType: asset.mimeType },
      {
        onSuccess: (doc) => navigation.navigate('Reader', { documentId: doc.id }),
        onError: (e) => setError(getErrorMessage(e, 'Upload failed')),
      },
    );
  };

  const progress =
    current && current.document.word_count > 0
      ? current.current_word_index / current.document.word_count
      : 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.greeting, { color: palette.text }]}>
          Hi {user?.name?.split(' ')[0] ?? 'there'} 👋
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          What would you like to read today?
        </Text>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: spacing.xl }} color={palette.primary} />
        ) : current ? (
          <Card style={styles.continueCard} onPress={() =>
            navigation.navigate('Reader', { documentId: current.document_id })
          }>
            <Text style={[styles.cardLabel, { color: palette.accent }]}>CONTINUE READING</Text>
            <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
              {current.document.title}
            </Text>
            <View style={styles.progressRow}>
              <ProgressBar progress={progress} />
            </View>
            <Text style={[styles.progressText, { color: palette.textMuted }]}>
              {Math.round(progress * 100)}% · word {current.current_word_index + 1} of{' '}
              {current.document.word_count}
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
          <Button
            title="⬆  Upload TXT or PDF"
            variant="secondary"
            loading={upload.isPending}
            onPress={onUpload}
          />
          <Button
            title="Browse library"
            variant="ghost"
            onPress={() => navigation.navigate('Tabs', { screen: 'Library' })}
          />
        </View>

        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={18} color={palette.accent} />
          <Text style={[styles.tip, { color: palette.textMuted }]}>
            Tip: tap the word area in the reader to play or pause.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: spacing.sm,
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
