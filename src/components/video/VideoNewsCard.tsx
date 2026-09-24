import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { VideoNewsItem } from '../../types/news';
import { useThemeColors } from '../../hooks/useThemeColors';
import { SPACING, RADIUS } from '../../constants/theme';

interface VideoNewsCardProps {
  video: VideoNewsItem;
  onPress: (video: VideoNewsItem) => void;
}

export const VideoNewsCard: React.FC<VideoNewsCardProps> = ({ video, onPress }) => {
  const { colors, brandColors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(video)}
      activeOpacity={0.85}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </View>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.categoryBadge, { backgroundColor: brandColors.primary + '15' }]}>
          <Text style={[styles.categoryText, { color: brandColors.primary }]}>
            {video.category}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {video.title}
        </Text>

        <View style={styles.footerRow}>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{video.author}</Text>
          <View style={styles.metaRight}>
            <Text style={[styles.views, { color: colors.textMuted }]}>
              {video.viewsCount.toLocaleString()} views
            </Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{video.publishedAt}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(230, 81, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  views: {
    fontSize: 11,
  },
  dot: {
    fontSize: 11,
  },
  time: {
    fontSize: 11,
  },
});
