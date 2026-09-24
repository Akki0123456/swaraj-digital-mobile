import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../../types/news';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { SPACING, RADIUS } from '../../constants/theme';

interface NewsCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = memo(
  ({ article, onPress }) => {
    const { colors, brandColors } = useThemeColors();
    const { isBookmarked, toggleBookmark } = useBookmarksStore();
    const bookmarked = isBookmarked(article.id);

    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => onPress(article)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: brandColors.primary + '15' }]}>
              <Text style={[styles.badgeText, { color: brandColors.primary }]}>
                {article.category}
              </Text>
            </View>
            <Text style={[styles.time, { color: colors.textMuted }]}>{article.publishedAt}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.readTimeGroup}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.readTimeText, { color: colors.textSecondary }]}>
                {article.readingTimeMinutes} min read
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(article)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Bookmark article"
            >
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={bookmarked ? brandColors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs + 2,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 128,
  },
  thumbnail: {
    width: 100,
    height: '100%',
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 11,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readTimeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
  },
  bookmarkButton: {
    padding: 2,
  },
});
