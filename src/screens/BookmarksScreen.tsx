import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RootStackParamList } from '../types/navigation';
import { NewsArticle } from '../types/news';
import { useBookmarksStore } from '../store/useBookmarksStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { Header } from '../components/common/Header';
import { NewsCard } from '../components/news/NewsCard';
import { SPACING, RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, brandColors } = useThemeColors();
  const { bookmarks } = useBookmarksStore();

  const handlePressArticle = (article: NewsArticle) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrapper}>
      <View style={[styles.iconCircle, { backgroundColor: colors.tagBg }]}>
        <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Articles Yet</Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Tap the bookmark icon on any news story to save it for offline reading anytime.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="SAVED STORIES"
        subtitle={`${bookmarks.length} saved for offline reading`}
        showSearch={false}
      />

      <View style={styles.listContainer}>
        {bookmarks.length === 0 ? (
          renderEmpty()
        ) : (
          <FlashList
            data={bookmarks}
            renderItem={({ item }) => <NewsCard article={item} onPress={handlePressArticle} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
