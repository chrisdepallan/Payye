import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';
import { useLibraryStore } from '../store/libraryStore';
import { useSessionsStore } from '../store/sessionsStore';
import { Document } from '../types';

export function LibraryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette } = useTheme();
  const documents = useLibraryStore((s) => s.documents);
  const removeDocument = useLibraryStore((s) => s.remove);
  const sessions = useSessionsStore((s) => s.sessions);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, query]);

  const confirmDelete = (doc: Document) => {
    Alert.alert('Delete document', `Remove "${doc.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeDocument(doc.id) },
    ]);
  };

  const renderItem = ({ item }: { item: Document }) => {
    const session = sessions[item.id];
    const percent =
      session && item.word_count > 0
        ? Math.min(session.current_word_index / item.word_count, 1)
        : 0;
    const completed = session?.status === 'completed';
    const hasProgress = !!session && percent > 0;

    return (
      <Card
        style={styles.item}
        onPress={() => navigation.navigate('Reader', { documentId: item.id })}
      >
        <View style={styles.itemRow}>
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemMeta, { color: palette.textMuted }]}>
              {item.word_count} words · {item.source_type.toUpperCase()}
              {completed
                ? ' · Finished'
                : hasProgress
                  ? ` · ${Math.round(percent * 100)}%`
                  : ''}
            </Text>
          </View>
          <Pressable onPress={() => confirmDelete(item)} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={palette.danger} />
          </Pressable>
        </View>
        {hasProgress ? (
          <View style={styles.itemProgress}>
            <ProgressBar progress={percent} />
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <Screen>
      <Text style={[styles.heading, { color: palette.text }]}>Library</Text>
      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Ionicons name="search" size={18} color={palette.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search documents"
          placeholderTextColor={palette.textMuted}
          style={[styles.searchInput, { color: palette.text }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="library-outline" size={40} color={palette.textMuted} />
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>
              {query ? 'No matching documents.' : 'Your library is empty. Add a document from Home.'}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  item: {
    paddingVertical: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  itemProgress: {
    marginTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
  },
});
