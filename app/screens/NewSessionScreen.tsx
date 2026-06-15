import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackScreenProps } from '../navigation/types';
import { useLibraryStore } from '../store/libraryStore';
import { countWords } from '../utils/tokenizer';

const DRAFT_KEY = 'payye.draft';

export function NewSessionScreen({ navigation }: RootStackScreenProps<'NewSession'>) {
  const { palette } = useTheme();
  const addDocument = useLibraryStore((s) => s.add);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then((draft) => {
      if (draft) setText(draft);
    });
  }, []);

  const onChangeText = (value: string) => {
    setText(value);
    void AsyncStorage.setItem(DRAFT_KEY, value);
  };

  const onStart = async () => {
    setError(null);
    if (!text.trim()) {
      setError('Paste some text to read.');
      return;
    }
    const resolvedTitle = title.trim() || text.trim().slice(0, 40) || 'Untitled';
    const doc = addDocument({ title: resolvedTitle, text: text.trim(), sourceType: 'text' });
    await AsyncStorage.removeItem(DRAFT_KEY);
    navigation.replace('Reader', { documentId: doc.id });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextField
          label="Title (optional)"
          value={title}
          onChangeText={setTitle}
          placeholder="My reading"
        />

        <Text style={[styles.label, { color: palette.textMuted }]}>Text</Text>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          placeholder="Paste or type the text you want to read…"
          placeholderTextColor={palette.textMuted}
          style={[
            styles.textArea,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
        />

        <Text style={[styles.count, { color: palette.textMuted }]}>{countWords(text)} words</Text>

        {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

        <Button title="Start reading" onPress={onStart} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textArea: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    minHeight: 160,
  },
  count: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  error: {
    marginBottom: spacing.sm,
  },
});
