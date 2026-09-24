import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../../types/news';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useBookmarksStore } from '../../store/useBookmarksStore';
import { useUserPreferences } from '../../store/userPreferences';
import { getScaledTypography } from '../../theme/typography';
import { SPACING, RADIUS } from '../../constants/theme';

interface FeaturedNewsCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
}

export const FeaturedNewsCard: React.FC<FeaturedNewsCardProps> = ({ article, onPress }) => {
  const { colors, brandColors } = useThemeColors();
  const { isBookmarked, toggleBookmark } = useBookmarksStore();
  const { fontSizeScaler, language } = useUserPreferences();
  const script = language === 'hi' ? 'devanagari' : 'latin';
  const typo = getScaledTypography(fontSizeScaler, script);
  const bookmarked = isBookmarked(article.id);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(article)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={250}
          priority="high"
        />
        <View style={styles.overlayBadge}>
          <Text style={styles.overlayBadgeText}>FEATURED STORY</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkFloat}
          onPress={() => toggleBookmark(article)}
          activeOpacity={0.8}
          accessibilityLabel="Save article"
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? brandColors.primary : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={[styles.categoryTag, { backgroundColor: brandColors.primary + '15' }]}>
            <Text style={[styles.categoryText, { color: brandColors.primary }]}>
              {article.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>{article.publishedAt}</Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {article.readingTimeMinutes} min read
          </Text>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: typo.heroHeadline.fontSize * 0.8,
              lineHeight: typo.heroHeadline.lineHeight * 0.8,
            },
          ]}
          numberOfLines={3}
        >
          {article.title}
        </Text>

        <Text
          style={[
            styles.summary,
            {
              color: colors.textSecondary,
              fontSize: typo.body.fontSize * 0.9,
              lineHeight: typo.body.lineHeight * 0.9,
            },
          ]}
          numberOfLines={2}
        >
          {article.summary}
        </Text>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.author, { color: colors.textSecondary }]}>By {article.author}</Text>
          <View style={styles.viewsRow}>
            <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.viewsText, { color: colors.textMuted }]}>
              {article.viewsCount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  overlayBadgeText: {
    color: '#FF8038',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookmarkFloat: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dot: {
    marginHorizontal: 6,
  },
  timeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
  },
});
