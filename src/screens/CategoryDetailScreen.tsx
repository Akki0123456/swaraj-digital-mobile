import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RootStackParamList } from '../types/navigation';
import { NewsArticle } from '../types/news';
import { getLiveNews } from '../services/newsService';
import { useThemeColors } from '../hooks/useThemeColors';
import { NewsCard } from '../components/news/NewsCard';
import { SPACING, RADIUS } from '../constants/theme';

type CategoryDetailRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CategoryDetailScreen: React.FC = () => {
  const route = useRoute<CategoryDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { category } = route.params;

  const { colors, brandColors } = useThemeColors();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getLiveNews({ category: category.id }).then((data) => {
      if (isMounted) {
        setArticles(data || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [category.id]);

  const handlePressArticle = (article: NewsArticle) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const renderHeader = () => (
    <View style={[styles.headerBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.badgeRow}>
        <View style={[styles.iconBox, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as any} size={24} color={category.color} />
        </View>
        <View style={styles.headerTitles}>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.name}</Text>
          <Text style={[styles.categoryMarathi, { color: brandColors.primary }]}>
            {category.marathiName}
          </Text>
        </View>
      </View>
      <Text style={[styles.categoryDesc, { color: colors.textSecondary }]}>
        {category.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{category.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl }}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={{ marginTop: 12, fontSize: 13, color: colors.textSecondary }}>
            Fetching live {category.name} news...
          </Text>
        </View>
      ) : (
        <FlashList
          data={articles}
          renderItem={({ item }) => <NewsCard article={item} onPress={handlePressArticle} />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No live articles currently filed under this beat.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerBanner: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTitles: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  categoryMarathi: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  categoryDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
