import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RootStackParamList } from '../types/navigation';
import { NewsArticle } from '../types/news';
import { MOCK_ARTICLES } from '../data/mockNews';
import { getLiveNews } from '../services/newsService';
import { useThemeColors } from '../hooks/useThemeColors';
import { NewsCard } from '../components/news/NewsCard';
import { SPACING, RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const POPULAR_SEARCH_TAGS = [
  'Supreme Court',
  'Krishi Mandi',
  'Metro Line',
  'AI Language Models',
  'Sensex Record',
  'World Archery',
  'Marathi Cinema',
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, brandColors } = useThemeColors();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await getLiveNews({ searchQuery: query.trim() });
        setSearchResults(results);
      } catch {
        // Fallback local
        const q = query.toLowerCase().trim();
        setSearchResults(
          MOCK_ARTICLES.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.summary.toLowerCase().includes(q) ||
              a.content.toLowerCase().includes(q)
          )
        );
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePressArticle = (article: NewsArticle) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input Bar */}
      <View style={[styles.searchBarWrapper, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.inputBox, { backgroundColor: colors.tagBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search news, topics, beats..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Suggested Tags */}
      {query.trim().length === 0 && (
        <ScrollView contentContainerStyle={styles.suggestionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            POPULAR SEARCH TOPICS
          </Text>
          <View style={styles.tagsGrid}>
            {POPULAR_SEARCH_TAGS.map((tag, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.tagButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSelectTag(tag)}
                activeOpacity={0.7}
              >
                <Ionicons name="trending-up" size={14} color={brandColors.primary} />
                <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Search Results List */}
      {searching && (
        <View style={{ padding: SPACING.lg, alignItems: 'center', gap: 8 }}>
          <ActivityIndicator color={brandColors.primary} size="small" />
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Searching live news APIs...</Text>
        </View>
      )}

      {!searching && query.trim().length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultCountRow}>
            <Text style={[styles.resultCountText, { color: colors.textSecondary }]}>
              {searchResults.length} {searchResults.length === 1 ? 'story' : 'stories'} found for "{query}"
            </Text>
          </View>

          <FlashList
            data={searchResults}
            renderItem={({ item }) => <NewsCard article={item} onPress={handlePressArticle} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.noResultsBox}>
                <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                <Text style={[styles.noResultsTitle, { color: colors.text }]}>No Matches Found</Text>
                <Text style={[styles.noResultsSubtext, { color: colors.textSecondary }]}>
                  Try checking your spelling or search by general topics like Politics, Farming, or Tech.
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    gap: 8,
  },
  backButton: {
    padding: 6,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  suggestionsContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultCountRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  noResultsBox: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  noResultsSubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
