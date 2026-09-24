import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common/Header';
import { VideoNewsCard } from '../components/video/VideoNewsCard';
import { MOCK_VIDEOS } from '../data/mockNews';
import { useThemeColors } from '../hooks/useThemeColors';
import { VideoNewsItem } from '../types/news';
import { SPACING, RADIUS } from '../constants/theme';

interface VideoPlayerModalProps {
  video: VideoNewsItem;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close video">
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle} numberOfLines={1}>
            {video.title}
          </Text>
        </View>

        <View style={styles.videoPlayerBox}>
          <VideoView
            style={styles.videoView}
            player={player}
            nativeControls
            allowsPictureInPicture
          />
        </View>

        <View style={styles.videoDetails}>
          <Text style={styles.videoCategory}>{video.category.toUpperCase()}</Text>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoMeta}>
            {video.author} • {video.viewsCount.toLocaleString()} views • {video.publishedAt}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export const VideosScreen: React.FC = () => {
  const { colors, brandColors } = useThemeColors();
  const [activeVideo, setActiveVideo] = useState<VideoNewsItem | null>(null);

  const handlePlayVideo = (video: VideoNewsItem) => {
    setActiveVideo(video);
  };

  const handlePlayLiveStream = () => {
    setActiveVideo({
      id: 'live-stream',
      title: 'Swaraj Digital 24x7 Live News Stream',
      category: 'LIVE TV',
      thumbnailUrl: MOCK_VIDEOS[0].thumbnailUrl,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 'LIVE',
      viewsCount: 84200,
      publishedAt: 'STREAMING NOW',
      author: 'Swaraj Live Broadcast',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SWARAJ VIDEO" subtitle="Bulletins, ground investigations & special reports" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Broadcast Banner */}
        <TouchableOpacity
          style={[styles.liveBanner, { borderColor: brandColors.breaking }]}
          onPress={handlePlayLiveStream}
          activeOpacity={0.85}
        >
          <View style={styles.liveBannerLeft}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>24X7 LIVE</Text>
            </View>
            <Text style={styles.liveHeading}>Swaraj Digital Live TV</Text>
            <Text style={styles.liveSubtext}>Non-stop breaking news, debates & ground reports</Text>
          </View>
          <View style={[styles.livePlayBtn, { backgroundColor: brandColors.breaking }]}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeadingRow}>
          <View style={[styles.headingIndicator, { backgroundColor: brandColors.primary }]} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            FEATURED VIDEO BULLETINS
          </Text>
        </View>

        {MOCK_VIDEOS.map((video) => (
          <VideoNewsCard key={video.id} video={video} onPress={handlePlayVideo} />
        ))}
      </ScrollView>

      {activeVideo && (
        <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  closeBtn: {
    padding: 6,
  },
  modalHeaderTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  videoPlayerBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  videoDetails: {
    padding: SPACING.lg,
  },
  videoCategory: {
    color: '#FF8038',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 8,
  },
  videoMeta: {
    color: '#94A3B8',
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  liveBanner: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: '#1E1010',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBannerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveHeading: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  liveSubtext: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 2,
  },
  livePlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
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
