import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../../types/news';
import { SPACING, RADIUS } from '../../constants/theme';

interface BreakingTickerProps {
  article?: NewsArticle;
  onPress: (article: NewsArticle) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ article, onPress }) => {
  if (!article) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(article)}
      activeOpacity={0.85}
      accessibilityLabel={`Breaking news: ${article.title}`}
    >
      <View style={styles.badge}>
        <View style={styles.flashDot} />
        <Text style={styles.badgeText}>BREAKING</Text>
      </View>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {article.title}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#991B1B', // Deep red
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginRight: 8,
  },
  flashDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: 6,
  },
});
