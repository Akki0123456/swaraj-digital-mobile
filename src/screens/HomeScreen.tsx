import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, RefreshControl, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RootStackParamList } from '../types/navigation';
import { NewsArticle } from '../types/news';
import { CATEGORIES } from '../constants/categories';
import { LOCATION_FILTERS, LocationFilter } from '../constants/locations';
import { getLiveNews } from '../services/newsService';
import { useThemeColors } from '../hooks/useThemeColors';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { TRANSLATIONS } from '../constants/translations';
import { Header } from '../components/common/Header';
import { BreakingTicker } from '../components/common/BreakingTicker';
import { LocationPills } from '../components/common/LocationPills';
import { CategoryPills } from '../components/common/CategoryPills';
import { FeaturedNewsCard } from '../components/news/FeaturedNewsCard';
import { NewsCard } from '../components/news/NewsCard';
import { SPACING, RADIUS } from '../constants/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, brandColors } = useThemeColors();
  const { user, isLoggedIn } = useAuthStore();
  const { language } = useSettingsStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<LocationFilter>(LOCATION_FILTERS[0]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  const fetchArticles = useCallback(async (catId: string, loc: LocationFilter, lang: 'en' | 'hi') => {
    setIsLiveLoading(true);
    try {
      const liveData = await getLiveNews({
        category: catId,
        locationQuery: loc.type !== 'all' ? loc.queryTerm : undefined,
        language: lang,
      });
      setArticles(liveData || []);
    } catch (err) {
      setArticles([]);
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(selectedCategoryId, selectedLocation, language);
  }, [selectedCategoryId, selectedLocation, language, fetchArticles]);

  const breakingArticle = useMemo(() => {
    return articles.find((a) => a.isBreaking) || articles[0];
  }, [articles]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.isFeatured) || articles[0];
  }, [articles]);

  const trendingArticles = useMemo(() => {
    const list = articles.filter((a) => a.isTrending);
    return list.length > 0 ? list : articles.slice(0, 4);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let list = articles;
    if (selectedCategoryId !== 'all') {
      list = list.filter((a) => a.categoryId === selectedCategoryId || a.category.toLowerCase() === selectedCategoryId.toLowerCase());
    } else {
      list = list.filter((a) => a.id !== featuredArticle?.id);
    }
    return list;
  }, [articles, selectedCategoryId, featuredArticle]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchArticles(selectedCategoryId, selectedLocation, language);
    setRefreshing(false);
  }, [fetchArticles, selectedCategoryId, selectedLocation, language]);

  const handlePressArticle = useCallback(
    (article: NewsArticle) => {
      navigation.navigate('ArticleDetail', { article });
    },
    [navigation]
  );

  const handlePressSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const renderHeader = useCallback(() => {
    return (
      <View>
        <LocationPills
          selectedLocationId={selectedLocation.id}
          onSelectLocation={setSelectedLocation}
        />

        <CategoryPills
          categories={CATEGORIES}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* User Welcome / Sign In Banner */}
        <View style={[styles.userBannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isLoggedIn && user ? (
            <View style={styles.userBannerLoggedIn}>
              <Image source={{ uri: user.avatarUrl }} style={styles.userAvatar} />
              <View style={styles.userBannerTextGroup}>
                <Text style={[styles.userGreeting, { color: colors.text }]}>
                  Namaskar, {user.name.split(' ')[0]}! 👋
                </Text>
                <Text style={[styles.userSubgreeting, { color: colors.textSecondary }]}>
                  Live news feed for {selectedLocation.name}.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.accountBadge, { backgroundColor: brandColors.primary + '18' }]}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
              >
                <Ionicons name="person" size={14} color={brandColors.primary} />
                <Text style={[styles.accountBadgeText, { color: brandColors.primary }]}>{t.account}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userBannerGuest}>
              <View style={styles.guestTextWrapper}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>
                  {t.welcome} ({selectedLocation.name})
                </Text>
                <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                  {t.loginSubtitle}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: brandColors.primary }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.signInButtonText}>{t.signIn} / {t.register}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLiveLoading && (
          <View style={styles.liveLoadingBar}>
            <ActivityIndicator size="small" color={brandColors.primary} />
            <Text style={[styles.liveLoadingText, { color: brandColors.primary }]}>
              {language === 'hi' ? `ताज़ा खबरें लोड हो रही हैं (${selectedLocation.hindiName})...` : `Fetching live news for ${selectedLocation.name}...`}
            </Text>
          </View>
        )}

        {selectedCategoryId === 'all' && featuredArticle && (
          <FeaturedNewsCard
            article={featuredArticle}
            onPress={handlePressArticle}
          />
        )}

        {/* Trending Stories Carousel */}
        {selectedCategoryId === 'all' && trendingArticles.length > 0 && (
          <View style={styles.trendingSection}>
            <View style={styles.sectionHeadingRow}>
              <View style={[styles.headingIndicator, { backgroundColor: brandColors.trending }]} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{t.trendingTopStories}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {trendingArticles.map((art, index) => (
                <TouchableOpacity
                  key={art.id}
                  style={[styles.trendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handlePressArticle(art)}
                  activeOpacity={0.85}
                >
                  <View style={styles.trendingImageContainer}>
                    <Image source={{ uri: art.imageUrl }} style={styles.trendingImage} contentFit="cover" />
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{art.trendingRank || index + 1}</Text>
                    </View>
                  </View>
                  <View style={styles.trendingContent}>
                    <Text style={[styles.trendingCategory, { color: brandColors.primary }]}>
                      {art.category.toUpperCase()}
                    </Text>
                    <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={2}>
                      {art.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sectionHeadingRow}>
          <View style={[styles.headingIndicator, { backgroundColor: brandColors.primary }]} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            {selectedCategoryId === 'all'
              ? `${selectedLocation.name.toUpperCase()} ${t.latestHeadlines}`
              : CATEGORIES.find((c) => c.id === selectedCategoryId)?.name.toUpperCase() || 'NEWS'}
          </Text>
        </View>
      </View>
    );
  }, [selectedCategoryId, selectedLocation, featuredArticle, trendingArticles, handlePressArticle, colors, brandColors, isLoggedIn, user, navigation, t]);

  const renderItem = useCallback(
    ({ item }: { item: NewsArticle }) => (
      <NewsCard article={item} onPress={handlePressArticle} />
    ),
    [handlePressArticle]
  );

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No articles found for this category.
        </Text>
      </View>
    );
  }, [colors.textSecondary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header onPressSearch={handlePressSearch} />
      <BreakingTicker article={breakingArticle} onPress={handlePressArticle} />

      <View style={styles.listWrapper}>
        <FlashList
          data={filteredArticles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={brandColors.primary}
              colors={[brandColors.primary]}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  userBannerCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  userBannerLoggedIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userBannerTextGroup: {
    flex: 1,
  },
  userGreeting: {
    fontSize: 15,
    fontWeight: '800',
  },
  userSubgreeting: {
    fontSize: 12,
    marginTop: 2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userBannerGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  guestTextWrapper: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guestSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  signInButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  liveLoadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 2,
    gap: 8,
  },
  liveLoadingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendingSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  trendingScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
    paddingVertical: SPACING.xs,
  },
  trendingCard: {
    width: 220,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trendingImageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  trendingContent: {
    padding: SPACING.md,
  },
  trendingCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
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
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
