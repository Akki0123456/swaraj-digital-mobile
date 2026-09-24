import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../constants/categories';
import { MOCK_ARTICLES } from '../data/mockNews';
import { useThemeColors } from '../hooks/useThemeColors';
import { Header } from '../components/common/Header';
import { SPACING, RADIUS } from '../constants/theme';
import { NewsCategory } from '../types/news';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, brandColors } = useThemeColors();

  // Exclude "all" from the categories list grid
  const beats = CATEGORIES.filter((c) => c.id !== 'all');

  const getArticleCount = (categoryId: string) => {
    return MOCK_ARTICLES.filter((a) => a.categoryId === categoryId).length;
  };

  const handleSelectCategory = (category: NewsCategory) => {
    navigation.navigate('CategoryDetail', { category });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="EXPLORE BEATS"
        subtitle="Browse journalism by category and state beats"
        onPressSearch={() => navigation.navigate('Search')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {beats.map((cat) => {
            const count = getArticleCount(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => handleSelectCategory(cat)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconWrapper, { backgroundColor: cat.color + '18' }]}>
                  <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                    <Text style={[styles.marathiName, { color: brandColors.primary }]}>
                      {cat.marathiName}
                    </Text>
                  </View>
                  <Text
                    style={[styles.description, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {cat.description}
                  </Text>
                </View>

                <View style={styles.rightAction}>
                  <View style={[styles.countBadge, { backgroundColor: colors.tagBg }]}>
                    <Text style={[styles.countText, { color: colors.textSecondary }]}>
                      {count} stories
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  grid: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  catName: {
    fontSize: 16,
    fontWeight: '800',
  },
  marathiName: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightAction: {
    alignItems: 'flex-end',
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
