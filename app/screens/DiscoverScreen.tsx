import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useBookSearch } from '../hooks/useBooks';
import { RootStackParamList } from '../navigation/types';
import { getErrorMessage } from '../services/api';
import { fetchBookText, SOURCES } from '../services/books';
import { useLibraryStore } from '../store/libraryStore';
import { trimToLimit } from '../utils/ebookText';
import { BookSummary } from '../types';

const LANGUAGES = [
  { code: '', label: 'All' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
];

export function DiscoverScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette } = useTheme();
  const addDocument = useLibraryStore((s) => s.add);

  const [sourceId, setSourceId] = useState(SOURCES[0].id);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');
  const [debouncedTopic, setDebouncedTopic] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const source = useMemo(() => SOURCES.find((s) => s.id === sourceId)!, [sourceId]);

  // Debounce the typed query/topic so we don't fire a request on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query);
      setDebouncedTopic(topic);
    }, 350);
    return () => clearTimeout(id);
  }, [query, topic]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookSearch(sourceId, debounced, {
    language: language || undefined,
    topic: debouncedTopic.trim() || undefined,
  });

  const results = useMemo(() => data?.pages.flatMap((p) => p.results) ?? [], [data]);

  const openBook = async (book: BookSummary) => {
    setActionError(null);
    setBusyId(book.id);
    try {
      const { text } = await fetchBookText(book.source, book.id);
      if (!text.trim()) {
        throw new Error('No readable text found for this book.');
      }
      const doc = addDocument({
        title: book.title,
        text: trimToLimit(text),
        sourceType: book.source,
      });
      navigation.navigate('Reader', { documentId: doc.id });
    } catch (e) {
      setActionError(getErrorMessage(e, 'Could not open this book.'));
    } finally {
      setBusyId(null);
    }
  };

  const renderItem = ({ item }: { item: BookSummary }) => (
    <Card style={styles.item} onPress={() => openBook(item)}>
      <View style={styles.itemRow}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverFallback, { backgroundColor: palette.surfaceAlt }]}>
            <Ionicons name="book-outline" size={22} color={palette.textMuted} />
          </View>
        )}
        <View style={styles.itemText}>
          <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.authors.length > 0 ? (
            <Text style={[styles.itemMeta, { color: palette.textMuted }]} numberOfLines={1}>
              {item.authors.join(', ')}
            </Text>
          ) : null}
          <Text style={[styles.itemMeta, { color: palette.textMuted }]}>
            {[
              item.languages.join(', ').toUpperCase(),
              item.downloadCount ? `${item.downloadCount.toLocaleString()} downloads` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        {busyId === item.id ? (
          <ActivityIndicator color={palette.primary} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
        )}
      </View>
    </Card>
  );

  return (
    <Screen>
      <Text style={[styles.heading, { color: palette.text }]}>Discover</Text>

      {/* Source picker */}
      {SOURCES.length > 1 ? (
        <View style={styles.chipRow}>
          {SOURCES.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              active={s.id === sourceId}
              onPress={() => setSourceId(s.id)}
              palette={palette}
            />
          ))}
        </View>
      ) : null}

      {/* Search box */}
      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Ionicons name="search" size={18} color={palette.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${source.name}`}
          placeholderTextColor={palette.textMuted}
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.searchInput, { color: palette.text }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Filters */}
      {source.supportsLanguage ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {LANGUAGES.map((l) => (
            <Chip
              key={l.code || 'all'}
              label={l.label}
              active={l.code === language}
              onPress={() => setLanguage(l.code)}
              palette={palette}
            />
          ))}
        </ScrollView>
      ) : null}

      {source.supportsTopic ? (
        <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Ionicons name="pricetag-outline" size={16} color={palette.textMuted} />
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="Filter by topic (e.g. history, fiction)"
            placeholderTextColor={palette.textMuted}
            autoCorrect={false}
            style={[styles.searchInput, { color: palette.text }]}
          />
        </View>
      ) : null}

      {actionError ? (
        <Text style={[styles.error, { color: palette.danger }]}>{actionError}</Text>
      ) : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={palette.textMuted} />
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>
            {getErrorMessage(error, 'Search failed. Check your connection.')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.source}:${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={palette.primary} style={{ marginVertical: spacing.md }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="compass-outline" size={40} color={palette.textMuted} />
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                {debounced.trim() || debouncedTopic.trim()
                  ? 'No books found. Try another search.'
                  : 'Search free ebooks and read them word by word.'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

function Chip({
  label,
  active,
  onPress,
  palette,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? palette.primary : palette.surface,
          borderColor: active ? palette.primary : palette.border,
        },
      ]}
    >
      <Text style={{ color: active ? palette.primaryText : palette.text, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
    paddingVertical: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cover: {
    width: 44,
    height: 64,
    borderRadius: radius.sm,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
  },
  error: {
    marginBottom: spacing.sm,
    fontSize: 14,
  },
});
