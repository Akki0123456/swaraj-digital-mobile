import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useThemeColors } from '../hooks/useThemeColors';
import { useBookmarksStore } from '../store/useBookmarksStore';
import { useUserPreferences } from '../store/userPreferences';
import { getScaledTypography, BASE_BODY_SIZE, MAX_BODY_SIZE, MIN_BODY_SIZE } from '../theme/typography';
import { useArticleDetailQuery } from '../api/feeds';
import { MOCK_ARTICLES } from '../data/mockNews';
import { FeedItemCard } from '../components/FeedItemCard';
import { SPACING, RADIUS } from '../constants/theme';

type ArticleDetailRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Vernacular Reading Engine Adhering to TC-MOB-04
 * Supports dynamic text scaler: Base (16px) to Max (26px) with zero text clipping.
 * Deep linking target for swaraj://article/:id (TC-MOB-02).
 */
export const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<ArticleDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const params = route.params || {};

  const articleId = params.article?.id || params.id || params.articleId || 'default-1';

  // React Query fetch contract with offline disk cache
  const { data: article, isLoading } = useArticleDetailQuery(articleId, params.article);

  const { colors, brandColors } = useThemeColors();
  const { isBookmarked, toggleBookmark } = useBookmarksStore();
  const {
    fontSizeScaler,
    setFontSizeScaler,
    language,
    audioSpeed,
  } = useUserPreferences();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTypographyControls, setShowTypographyControls] = useState(false);

  const script = language === 'hi' ? 'devanagari' : 'latin';
  const typo = getScaledTypography(fontSizeScaler, script);

  const currentArticle = article || params.article;
  const bookmarked = currentArticle ? isBookmarked(currentArticle.id) : false;

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleShare = async () => {
    if (!currentArticle) return;
    try {
      await Share.share({
        title: currentArticle.title,
        message: `${currentArticle.title}\n\nRead more on Swaraj Digital:\nswaraj://article/${currentArticle.id}`,
      });
    } catch {
      // ignore
    }
  };

  const handleToggleAudio = () => {
    if (!currentArticle) return;
    if (isPlayingAudio) {
      Speech.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = `${currentArticle.title}. ${currentArticle.summary}`;
      Speech.speak(textToSpeak, {
        rate: audioSpeed,
        language: language === 'hi' ? 'hi-IN' : 'en-IN',
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  // Step text scaler: 16px -> 18px -> 21px -> 26px
  const handleIncreaseFont = () => {
    setFontSizeScaler(Math.min(MAX_BODY_SIZE, fontSizeScaler + 2));
  };

  const handleDecreaseFont = () => {
    setFontSizeScaler(Math.max(MIN_BODY_SIZE, fontSizeScaler - 2));
  };

  if (isLoading && !currentArticle) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={brandColors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading vernacular story...
        </Text>
      </View>
    );
  }

  if (!currentArticle) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Story not found.</Text>
        <TouchableOpacity
          style={[styles.backHomeBtn, { backgroundColor: brandColors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backHomeText}>Return to Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const relatedArticles = MOCK_ARTICLES.filter((a) => a.id !== currentArticle.id).slice(0, 3);

  // Parse summary bullet points (MongoDB schema: summaryBullets: string[])
  const bullets = currentArticle.summary
    ? currentArticle.summary.split('. ').filter(Boolean)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Navigation */}
      <View
        style={[
          styles.navHeader,
          { backgroundColor: colors.headerBg, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.navRightActions}>
          {/* Vernacular Font Scaler Trigger (TC-MOB-04) */}
          <TouchableOpacity
            style={[
              styles.fontButton,
              {
                backgroundColor: showTypographyControls ? brandColors.primary : colors.tagBg,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowTypographyControls(!showTypographyControls)}
            accessibilityLabel="Adjust text scaler"
          >
            <Text
              style={[
                styles.fontButtonText,
                { color: showTypographyControls ? '#FFFFFF' : colors.text },
              ]}
            >
              अ/A {fontSizeScaler}px
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => toggleBookmark(currentArticle)}
            accessibilityLabel="Bookmark article"
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? brandColors.primary : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleShare}
            accessibilityLabel="Share article"
          >
            <Ionicons name="share-social-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Typography Scaler HUD (TC-MOB-04: Base 16px to Max 26px reflow) */}
      {showTypographyControls && (
        <View style={[styles.typographyHUD, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.hudLabel, { color: colors.textSecondary }]}>
            Vernacular Text Scaler (TC-MOB-04):
          </Text>
          <View style={styles.hudControls}>
            <TouchableOpacity
              style={[styles.hudBtn, { borderColor: colors.border }]}
              onPress={handleDecreaseFont}
              disabled={fontSizeScaler <= MIN_BODY_SIZE}
            >
              <Text style={[styles.hudBtnText, { color: colors.text }]}>A-</Text>
            </TouchableOpacity>

            <Text style={[styles.hudCurrentVal, { color: brandColors.primary }]}>
              {fontSizeScaler}px {fontSizeScaler === BASE_BODY_SIZE ? '(Base)' : fontSizeScaler === MAX_BODY_SIZE ? '(Max)' : ''}
            </Text>

            <TouchableOpacity
              style={[styles.hudBtn, { borderColor: colors.border }]}
              onPress={handleIncreaseFont}
              disabled={fontSizeScaler >= MAX_BODY_SIZE}
            >
              <Text style={[styles.hudBtnText, { color: colors.text }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentArticle.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />
          <View style={styles.imageOverlaySource}>
            <Text style={styles.sourceText}>Source: {currentArticle.source}</Text>
          </View>
        </View>

        <View style={styles.bodyWrapper}>
          {/* Metadata Row */}
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: currentArticle.isBreaking
                    ? '#FEE2E2'
                    : brandColors.primary + '18',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: currentArticle.isBreaking ? '#DC2626' : brandColors.primary },
                ]}
              >
                {currentArticle.isBreaking
                  ? '🚨 BREAKING NEWS'
                  : currentArticle.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {currentArticle.publishedAt}
            </Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {currentArticle.readingTimeMinutes} min read
            </Text>
          </View>

          {/* Dynamic Headline reflowing dynamically without clipping */}
          <Text
            style={[
              styles.headline,
              {
                color: colors.text,
                fontSize: typo.heroHeadline.fontSize,
                lineHeight: typo.heroHeadline.lineHeight,
              },
            ]}
          >
            {currentArticle.title}
          </Text>

          {/* AI Narration Player Bar */}
          <TouchableOpacity
            style={[
              styles.audioBar,
              {
                backgroundColor: isPlayingAudio ? brandColors.primary : colors.tagBg,
                borderColor: colors.border,
              },
            ]}
            onPress={handleToggleAudio}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isPlayingAudio ? 'pause-circle' : 'play-circle'}
              size={24}
              color={isPlayingAudio ? '#FFFFFF' : brandColors.primary}
            />
            <View style={styles.audioTextGroup}>
              <Text
                style={[styles.audioTitle, { color: isPlayingAudio ? '#FFFFFF' : colors.text }]}
              >
                {isPlayingAudio ? 'Playing Audio Summary...' : 'Listen to News (Audio Narration)'}
              </Text>
              <Text
                style={[
                  styles.audioSubtitle,
                  { color: isPlayingAudio ? '#FFE4D6' : colors.textSecondary },
                ]}
              >
                AI text-to-speech audio reader • {currentArticle.readingTimeMinutes} mins
              </Text>
            </View>
          </TouchableOpacity>

          {/* Summary Bullets (Section 4.1 Schema summaryBullets) */}
          {bullets.length > 0 && (
            <View
              style={[
                styles.summaryBulletsBox,
                { backgroundColor: colors.tagBg, borderLeftColor: brandColors.primary },
              ]}
            >
              <Text style={[styles.bulletsHeading, { color: brandColors.primary }]}>
                मुख्य बिंदु (KEY HIGHLIGHTS)
              </Text>
              {bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: brandColors.primary }]}>▪</Text>
                  <Text
                    style={[
                      styles.bulletText,
                      {
                        color: colors.text,
                        fontSize: typo.summaryBullet.fontSize,
                        lineHeight: typo.summaryBullet.lineHeight,
                      },
                    ]}
                  >
                    {bullet.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Vernacular Article Body with dynamic line-height reflow */}
          <View style={styles.contentContainer}>
            {currentArticle.content.split('\n\n').map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  {
                    color: colors.text,
                    fontSize: typo.body.fontSize,
                    lineHeight: typo.body.lineHeight,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={[styles.tagsHeading, { color: colors.textSecondary }]}>TAGS</Text>
            <View style={styles.tagsRow}>
              {currentArticle.tags.map((tag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tagPill,
                    { backgroundColor: colors.tagBg, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.tagPillText, { color: colors.tagText }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Related Stories */}
          <View style={[styles.relatedSection, { borderTopColor: colors.border }]}>
            <View style={styles.sectionHeadingRow}>
              <View style={[styles.headingIndicator, { backgroundColor: brandColors.primary }]} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>RELATED STORIES</Text>
            </View>

            {relatedArticles.map((item) => (
              <FeedItemCard
                key={item.id}
                article={item}
                onPress={(selected) => navigation.push('ArticleDetail', { article: selected })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backHomeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  backHomeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: 8,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  fontButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  typographyHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  hudLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  hudControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  hudBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  hudCurrentVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlaySource: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sourceText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '500',
  },
  bodyWrapper: {
    paddingTop: SPACING.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dot: {
    marginHorizontal: 6,
  },
  metaText: {
    fontSize: 12,
  },
  headline: {
    paddingHorizontal: SPACING.lg,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  audioBar: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  audioTextGroup: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  audioSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryBulletsBox: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderRadius: RADIUS.xs,
    gap: 8,
  },
  bulletsHeading: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  paragraph: {
    marginBottom: 16,
  },
  tagsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tagsHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  relatedSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.lg,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 8,
  },
  headingIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
