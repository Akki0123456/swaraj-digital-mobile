import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { VideoNewsCard } from '../components/video/VideoNewsCard';
import { MOCK_VIDEOS } from '../data/mockNews';
import { useThemeColors } from '../hooks/useThemeColors';
import { MediaViewer } from '../components/MediaViewer';
import { VideoNewsItem } from '../types/news';
import { SPACING, RADIUS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Official Swaraj Digital Live Channels
 * Connected to Swaraj Network Broadcasts (swarajdigital.in / YouTube Live)
 */
export const SWARAJ_LIVE_CHANNELS = [
  {
    id: 'live-swaraj-express',
    name: 'स्वराज एक्सप्रेस SMBC (24x7 लाइव)',
    subtitle: 'राष्ट्रीय, मध्यप्रदेश व छत्तीसगढ़ मुख्य समाचार',
    channelId: 'UCywag9AKHWPBnZCrZpo5D0w',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCywag9AKHWPBnZCrZpo5D0w',
    badge: 'MAIN 24X7',
  },
  {
    id: 'live-mp-swaraj',
    name: 'MP स्वराज डिजिटल लाइव',
    subtitle: 'भोपाल, इंदौर, ग्वालियर, उज्जैन व मप्र की हर खबर',
    channelId: 'UC4H95ePSOyslyvxJx97_uaA',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4H95ePSOyslyvxJx97_uaA',
    badge: 'मप्र लाइव',
  },
];

interface VideoPlayerModalProps {
  video: VideoNewsItem;
  isActive: boolean;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, isActive, onClose }) => {
  const isLive = video.category === 'LIVE TV' || video.duration === 'LIVE';

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close video">
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.modalHeaderTitleBox}>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {video.title}
            </Text>
            {isLive && (
              <View style={styles.modalLiveIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.modalLiveText}>LIVE</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.videoPlayerBox}>
          <MediaViewer
            videoUrl={video.videoUrl}
            isLive={isLive}
            isActive={isActive}
            showControls={true}
          />
        </View>

        <ScrollView style={styles.videoDetailsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.videoDetails}>
            <View style={styles.categoryPillRow}>
              <View style={styles.modalCategoryBadge}>
                <Text style={styles.videoCategory}>{video.category.toUpperCase()}</Text>
              </View>
              {isLive && (
                <View style={styles.officialBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text style={styles.officialBadgeText}>Official Broadcast</Text>
                </View>
              )}
            </View>

            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoMeta}>
              {video.author} • {video.viewsCount.toLocaleString()} दर्शक • {video.publishedAt}
            </Text>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitle}>स्वराज डिजिटल बुलेटिन विवरण:</Text>
              <Text style={styles.descriptionText}>
                स्वराज डिजिटल और स्वराज एक्सप्रेस पर 24 घंटे निष्पक्ष, सटीक और सबसे तेज खबरें।
                मध्य प्रदेश, छत्तीसगढ़ और देश-दुनिया के ताज़ा समाचारों के लिए जुड़े रहें।
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export const VideosScreen: React.FC = () => {
  const { colors, brandColors } = useThemeColors();
  const isFocused = useIsFocused();
  const [activeVideo, setActiveVideo] = useState<VideoNewsItem | null>(null);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState<number>(0);

  // Tab switch safety: automatically close/pause active video when user switches away
  useEffect(() => {
    if (!isFocused && activeVideo) {
      setActiveVideo(null);
    }
  }, [isFocused]);

  const currentChannel = SWARAJ_LIVE_CHANNELS[selectedChannelIndex];

  const handlePlayVideo = (video: VideoNewsItem) => {
    setActiveVideo(video);
  };

  const handlePlayLiveStream = (channel = currentChannel) => {
    setActiveVideo({
      id: channel.id,
      title: `${channel.name} - 24x7 सीधा प्रसारण`,
      category: 'LIVE TV',
      thumbnailUrl: MOCK_VIDEOS[0].thumbnailUrl,
      videoUrl: channel.streamUrl,
      duration: 'LIVE',
      viewsCount: 142000,
      publishedAt: 'लाइव प्रसारण जारी',
      author: 'स्वराज डिजिटल लाइव डेस्क',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SWARAJ VIDEO" subtitle="लाइव टीवी, वीडियो बुलेटिन और ग्राउंड रिपोर्ट" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Swaraj 24x7 Live Broadcast Banner */}
        <View style={styles.liveSectionContainer}>
          <TouchableOpacity
            style={[styles.liveBanner, { borderColor: brandColors.breaking }]}
            onPress={() => handlePlayLiveStream()}
            activeOpacity={0.88}
          >
            <View style={styles.liveBannerLeft}>
              <View style={styles.liveIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveText}>SWARAJ 24X7 LIVE TV</Text>
              </View>
              <Text style={styles.liveHeading}>{currentChannel.name}</Text>
              <Text style={styles.liveSubtext}>{currentChannel.subtitle}</Text>
            </View>
            <View style={[styles.livePlayBtn, { backgroundColor: brandColors.breaking }]}>
              <Ionicons name="play" size={26} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
          </TouchableOpacity>

          {/* Channel Selector Pills */}
          <View style={styles.channelRow}>
            {SWARAJ_LIVE_CHANNELS.map((ch, idx) => {
              const isSelected = idx === selectedChannelIndex;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    styles.channelTab,
                    isSelected ? styles.channelTabActive : styles.channelTabInactive,
                  ]}
                  onPress={() => {
                    setSelectedChannelIndex(idx);
                    handlePlayLiveStream(ch);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.miniDot, isSelected && styles.miniDotActive]} />
                  <Text
                    style={[
                      styles.channelTabText,
                      isSelected ? styles.channelTabTextActive : styles.channelTabTextInactive,
                    ]}
                  >
                    {ch.badge}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeadingRow}>
          <View style={[styles.headingIndicator, { backgroundColor: brandColors.primary }]} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            स्वराज प्रमुख वीडियो बुलेटिन
          </Text>
        </View>

        {/* Video Bulletin Cards */}
        {MOCK_VIDEOS.map((video) => (
          <VideoNewsCard key={video.id} video={video} onPress={handlePlayVideo} />
        ))}
      </ScrollView>

      {/* Video / Live TV Modal Player */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          isActive={isFocused}
          onClose={() => setActiveVideo(null)}
        />
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
    backgroundColor: '#0A0F1D',
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
  modalHeaderTitleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalLiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  modalLiveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  videoPlayerBox: {
    width: '100%',
    height: 250,
    backgroundColor: '#000000',
  },
  videoDetailsScroll: {
    flex: 1,
  },
  videoDetails: {
    padding: SPACING.lg,
  },
  categoryPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalCategoryBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.4)',
  },
  videoCategory: {
    color: '#FF8038',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  officialBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 8,
  },
  videoMeta: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  descriptionBox: {
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  descriptionTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  liveSectionContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  liveBanner: {
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
    paddingHorizontal: 8,
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
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  liveSubtext: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  livePlayBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  channelTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 6,
    borderWidth: 1,
  },
  channelTabActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: '#DC2626',
  },
  channelTabInactive: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  miniDotActive: {
    backgroundColor: '#DC2626',
  },
  channelTabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  channelTabTextActive: {
    color: '#EF4444',
  },
  channelTabTextInactive: {
    color: '#94A3B8',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
