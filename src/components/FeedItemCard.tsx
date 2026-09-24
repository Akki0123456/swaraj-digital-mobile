import React, { memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../types/news';
import { useThemeColors } from '../hooks/useThemeColors';
import { useUserPreferences } from '../store/userPreferences';
import { getScaledTypography } from '../theme/typography';
import { SPACING, RADIUS } from '../constants/theme';

interface FeedItemCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
  onBookmark?: (article: NewsArticle) => void;
  isBookmarked?: boolean;
}

/**
 * High-Performance Recycled Feed Cell for @shopify/flash-list
 * SLA Compliance: 60-120 FPS continuous scroll via cell recycling & flat view hierarchy (TC-MOB-01).
 */
export const FeedItemCard: React.FC<FeedItemCardProps> = memo(
  ({ article, onPress, onBookmark, isBookmarked = false }) => {
    const { colors, brandColors } = useThemeColors();
    const fontSizeScaler = useUserPreferences((s) => s.fontSizeScaler);
    const script = useUserPreferences((s) => s.language) === 'hi' ? 'devanagari' : 'latin';

    const typo = getScaledTypography(fontSizeScaler, script);

    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => onPress(article)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Article: ${article.title}`}
      >
        {/* Left Content Column */}
        <View style={styles.contentColumn}>
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: article.isBreaking ? '#FEE2E2' : brandColors.primary + '18' },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: article.isBreaking ? '#DC2626' : brandColors.primary },
                ]}
              >
                {article.isBreaking ? '🚨 BREAKING' : article.category.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {article.publishedAt}
            </Text>
          </View>

          {/* Vernacular Headline with dynamic reflow */}
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typo.headline.fontSize * 0.72,
                lineHeight: typo.headline.lineHeight * 0.74,
              },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {article.title}
          </Text>

          {/* Footer stats & actions */}
          <View style={styles.footerRow}>
            <Text style={[styles.authorText, { color: colors.textSecondary }]} numberOfLines={1}>
              {article.source} • {article.readingTimeMinutes}m read
            </Text>

            {onBookmark && (
              <TouchableOpacity
                onPress={() => onBookmark(article)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.bookmarkAction}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={isBookmarked ? brandColors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right Thumbnail Column */}
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>
      </TouchableOpacity>
    );
  }
);

FeedItemCard.displayName = 'FeedItemCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    minHeight: 108,
  },
  contentColumn: {
    flex: 1,
    paddingRight: SPACING.md,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  categoryText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metaDot: {
    marginHorizontal: 5,
    fontSize: 10,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorText: {
    fontSize: 10.5,
    fontWeight: '500',
    flex: 1,
  },
  bookmarkAction: {
    paddingLeft: 6,
  },
  thumbnailWrapper: {
    width: 96,
    height: 80,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
