import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsCategory } from '../../types/news';
import { useThemeColors } from '../../hooks/useThemeColors';
import { SPACING, RADIUS } from '../../constants/theme';

interface CategoryPillsProps {
  categories: NewsCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { colors, brandColors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isSelected
                  ? { backgroundColor: brandColors.primary, borderColor: brandColors.primary }
                  : { backgroundColor: colors.tagBg, borderColor: colors.border },
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={cat.icon as any}
                size={15}
                color={isSelected ? '#FFFFFF' : cat.color}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextActive : { color: colors.textSecondary },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
