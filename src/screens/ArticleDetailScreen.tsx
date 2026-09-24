import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useThemeColors } from '../hooks/useThemeColors';
import { useBookmarksStore } from '../store/useBookmarksStore';
import { useSettingsStore, FontSizeScale } from '../store/useSettingsStore';
import { MOCK_ARTICLES } from '../data/mockNews';
import { NewsCard } from '../components/news/NewsCard';
import { SPACING, RADIUS } from '../constants/theme';

type ArticleDetailRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<ArticleDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { article } = route.params;

  const { colors, brandColors, fontSizes } = useThemeColors();
  const { isBookmarked, toggleBookmark } = useBookmarksStore();
  const { fontSize, setFontSize, audioSpeed, language } = useSettingsStore();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const bookmarked = isBookmarked(article.id);

  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead more on Swaraj Digital:\n${article.summary}`,
      });
    } catch {
      // ignore
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      Speech.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = `${article.title}. ${article.summary}`;
      Speech.speak(textToSpeak, {
        rate: audioSpeed,
        language: language === 'hi' ? 'hi-IN' : 'en-IN',
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleCycleFontSize = () => {
    const scales: FontSizeScale[] = ['sm', 'md', 'lg', 'xl'];
    const currentIndex = scales.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % scales.length;
    setFontSize(scales[nextIndex]);
  };

  const relatedArticles = MOCK_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navigation Header */}
      <View style={[styles.navHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.navRightActions}>
          <TouchableOpacity
            style={[styles.fontButton, { backgroundColor: colors.tagBg, borderColor: colors.border }]}
            onPress={handleCycleFontSize}
            accessibilityLabel="Adjust font size"
          >
            <Text style={[styles.fontButtonText, { color: colors.text }]}>
              A <Text style={{ fontSize: 10 }}>({fontSize.toUpperCase()})</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => toggleBookmark(article)}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
            priority="high"
          />
          <View style={styles.imageOverlaySource}>
            <Text style={styles.sourceText}>Source: {article.source}</Text>
          </View>
        </View>

        <View style={styles.bodyWrapper}>
          {/* Metadata */}
          <View style={styles.categoryRow}>
            <View style={[styles.badge, { backgroundColor: brandColors.primary + '18' }]}>
              <Text style={[styles.badgeText, { color: brandColors.primary }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{article.publishedAt}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {article.readingTimeMinutes} min read
            </Text>
          </View>

          {/* Headline */}
          <Text
            style={[
              styles.headline,
              { color: colors.text, fontSize: fontSizes.headline, lineHeight: fontSizes.headline * 1.3 },
            ]}
          >
            {article.title}
          </Text>

          {/* Audio narration bar */}
          <TouchableOpacity
            style={[
              styles.audioBar,
              { backgroundColor: isPlayingAudio ? brandColors.primary : colors.tagBg, borderColor: colors.border },
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
              <Text style={[styles.audioTitle, { color: isPlayingAudio ? '#FFFFFF' : colors.text }]}>
                {isPlayingAudio ? 'Playing Audio Summary...' : 'Listen to News (Audio Narration)'}
              </Text>
              <Text
                style={[
                  styles.audioSubtitle,
                  { color: isPlayingAudio ? '#FFE4D6' : colors.textSecondary },
                ]}
              >
                AI text-to-speech audio reader • {article.readingTimeMinutes} mins
              </Text>
            </View>
          </TouchableOpacity>

          {/* Author info */}
          <View style={[styles.authorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {article.authorAvatar ? (
              <Image source={{ uri: article.authorAvatar }} style={styles.authorAvatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.avatarInitial}>{article.author[0]}</Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>{article.author}</Text>
              <Text style={[styles.authorRole, { color: colors.textSecondary }]}>
                Senior Correspondent • {article.source}
              </Text>
            </View>
          </View>

          {/* Summary Lead */}
          <View style={[styles.summaryBox, { backgroundColor: colors.tagBg, borderLeftColor: brandColors.primary }]}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{article.summary}</Text>
          </View>

          {/* Full Article Body */}
          <View style={styles.contentContainer}>
            {article.content.split('\n\n').map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  {
                    color: colors.text,
                    fontSize: fontSizes.body,
                    lineHeight: fontSizes.body * 1.65,
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
              {article.tags.map((tag, idx) => (
                <View
                  key={idx}
                  style={[styles.tagPill, { backgroundColor: colors.tagBg, borderColor: colors.border }]}
                >
                  <Text style={[styles.tagPillText, { color: colors.tagText }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Related Articles */}
          <View style={[styles.relatedSection, { borderTopColor: colors.border }]}>
            <View style={styles.sectionHeadingRow}>
              <View style={[styles.headingIndicator, { backgroundColor: brandColors.primary }]} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>RELATED STORIES</Text>
            </View>

            {relatedArticles.map((item) => (
              <NewsCard
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  fontButtonText: {
    fontSize: 12,
    fontWeight: '700',
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
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  authorInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorRole: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryBox: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderRadius: RADIUS.xs,
  },
  summaryText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  paragraph: {
    marginBottom: 16,
    letterSpacing: 0.1,
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
