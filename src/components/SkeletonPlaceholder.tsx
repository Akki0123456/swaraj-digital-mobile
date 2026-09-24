import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { SPACING, RADIUS } from '../constants/theme';

interface SkeletonProps {
  style?: ViewStyle;
  variant?: 'feedItem' | 'featuredHero' | 'ticker' | 'card';
}

/**
 * Shimmer Layout Bounds component satisfying SLA Cold Start Latency <= 1.8s
 * Provides instant perceptual feedback before network response.
 */
export const SkeletonPlaceholder: React.FC<SkeletonProps> = ({ style, variant = 'feedItem' }) => {
  const { isDark } = useThemeColors();
  const animatedOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedOpacity]);

  const baseBg = isDark ? '#1E293B' : '#E2E8F0';
  const innerBg = isDark ? '#334155' : '#CBD5E1';

  if (variant === 'feedItem') {
    return (
      <View style={[styles.feedItemContainer, { backgroundColor: baseBg }, style]}>
        <View style={styles.feedItemLeft}>
          <Animated.View style={[styles.shimmerBadge, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.shimmerLineLong, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.shimmerLineMid, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.shimmerLineShort, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
        </View>
        <Animated.View style={[styles.shimmerThumb, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
      </View>
    );
  }

  if (variant === 'featuredHero') {
    return (
      <View style={[styles.heroContainer, { backgroundColor: baseBg }, style]}>
        <Animated.View style={[styles.heroImage, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
        <View style={styles.heroContent}>
          <Animated.View style={[styles.shimmerBadge, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.shimmerLineLong, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
          <Animated.View style={[styles.shimmerLineMid, { backgroundColor: innerBg, opacity: animatedOpacity }]} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.defaultBox,
        { backgroundColor: innerBg, opacity: animatedOpacity },
        style,
      ]}
    />
  );
};

export const FeedSkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonPlaceholder key={idx} variant="feedItem" />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: SPACING.xs,
  },
  feedItemContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    height: 108,
  },
  feedItemLeft: {
    flex: 1,
    paddingRight: SPACING.md,
    justifyContent: 'space-between',
  },
  shimmerBadge: {
    width: 60,
    height: 14,
    borderRadius: RADIUS.xs,
  },
  shimmerLineLong: {
    width: '95%',
    height: 14,
    borderRadius: RADIUS.xs,
  },
  shimmerLineMid: {
    width: '75%',
    height: 14,
    borderRadius: RADIUS.xs,
  },
  shimmerLineShort: {
    width: '45%',
    height: 10,
    borderRadius: RADIUS.xs,
  },
  shimmerThumb: {
    width: 96,
    height: 80,
    borderRadius: RADIUS.sm,
    alignSelf: 'center',
  },
  heroContainer: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroContent: {
    padding: SPACING.md,
    gap: 8,
  },
  defaultBox: {
    borderRadius: RADIUS.md,
  },
});
