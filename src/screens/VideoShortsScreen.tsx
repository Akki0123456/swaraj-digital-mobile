import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Share,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MediaViewer } from '../components/MediaViewer';
import { VideoNewsItem } from '../types/news';
import { useBookmarksStore } from '../store/useBookmarksStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Authentic MP Swaraj (Madhya Pradesh) News Shorts
 * Covering Indore, Bhopal, Datia, Chhatarpur, Gwalior & ground investigations across MP.
 */
export const SHORTS_DATA: VideoNewsItem[] = [
  {
    id: 'short-mp-1',
    title: 'Indore Metro का भव्य शुभारंभ! CM Dr. Mohan Yadav ने दिखाई हरी झंडी, सुपर कॉरिडोर से दौड़ी मेट्रो',
    category: 'मप्र - इंदौर',
    thumbnailUrl: 'https://img.youtube.com/vi/YRiuE6B9_jw/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/YRiuE6B9_jw',
    duration: '0:55',
    viewsCount: 284000,
    publishedAt: '20 mins ago',
    author: 'MP Swaraj',
  },
  {
    id: 'short-mp-2',
    title: 'Bhopal: तिरंगा यात्रा का भव्य आयोजन, CM Dr. Mohan Yadav हुए शामिल | राजधानी में भारी उत्साह',
    category: 'मप्र - भोपाल',
    thumbnailUrl: 'https://img.youtube.com/vi/7SmSopE_z_w/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/7SmSopE_z_w',
    duration: '0:50',
    viewsCount: 195000,
    publishedAt: '45 mins ago',
    author: 'MP Swaraj Bhopal',
  },
  {
    id: 'short-mp-3',
    title: 'Datia News: हाईवे पर युवक से मारपीट, फिर स्कॉर्पियो में घसीटा; पुलिस ने 6 आरोपियों पर दर्ज किया केस',
    category: 'मप्र - दतिया',
    thumbnailUrl: 'https://img.youtube.com/vi/DLC96AwZ3oc/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/DLC96AwZ3oc',
    duration: '0:48',
    viewsCount: 220000,
    publishedAt: '1 hour ago',
    author: 'MP Swaraj Crime Desk',
  },
  {
    id: 'short-mp-4',
    title: 'Bageshwar Baba का पर्चा फेल?, मचा बवाल | Dhirendra Shastri Controversy | Chhatarpur Ground Report',
    category: 'मप्र - छतरपुर',
    thumbnailUrl: 'https://img.youtube.com/vi/TP2_y12xbCg/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/TP2_y12xbCg',
    duration: '0:58',
    viewsCount: 340000,
    publishedAt: '2 hours ago',
    author: 'MP Swaraj Special',
  },
  {
    id: 'short-mp-5',
    title: 'Pandokhar Sarkar vs Bageshwar Baba: खुले मंच पर क्यों भिड़े दोनों बाबा? Exclusive MP News',
    category: 'मप्र - ग्वालियर',
    thumbnailUrl: 'https://img.youtube.com/vi/jsHOdX-uvwc/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/jsHOdX-uvwc',
    duration: '1:10',
    viewsCount: 310000,
    publishedAt: '3 hours ago',
    author: 'MP Swaraj Investigation',
  },
  {
    id: 'short-mp-6',
    title: 'MP के Bittu Tabahi ने अकेले साफ कर दी पूरी नदी! 3 महीने की अनोखी मेहनत ने बदल दी तस्वीर',
    category: 'मप्र - ग्राउंड रिपोर्ट',
    thumbnailUrl: 'https://img.youtube.com/vi/9XzzfesVG5g/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/9XzzfesVG5g',
    duration: '0:52',
    viewsCount: 178000,
    publishedAt: '4 hours ago',
    author: 'MP Swaraj Ground Watch',
  },
];

/**
 * High-performance Vertical Swipe Media Engine adhering to TC-MOB-05.
 * Features:
 * - Tab Change Safe: Pauses immediately when user navigates away or switches bottom tab
 * - Single active hardware decoder enforcement: ONLY focused item at activeIndex plays
 * - Swiping away instantly disposes video to prevent decoder starvation on Android
 * - Engagement action stack (Like, Save/Bookmark, Share)
 */
export const VideoShortsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused(); // Crucial: detects when user switches tabs!
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const { toggleBookmark, isBookmarked } = useBookmarksStore();

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const handleShare = async (item: VideoNewsItem) => {
    try {
      await Share.share({
        title: item.title,
        message: `${item.title}\n\nस्वराज डिजिटल पर देखें पूरी खबर:\nhttps://www.swarajdigital.in/`,
      });
    } catch {
      // ignore
    }
  };

  const toggleLike = (id: string) => {
    setLikedShorts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = useCallback(
    ({ item, index }: { item: VideoNewsItem; index: number }) => {
      // Only active if BOTH: this card is currently in view AND the Shorts tab is currently focused
      const isItemActive = isFocused && index === activeIndex;
      const isLiked = Boolean(likedShorts[item.id]);
      const bookmarked = isBookmarked(item.id);

      return (
        <View style={[styles.shortContainer, { height: SCREEN_HEIGHT }]}>
          {/*
            CRITICAL FIX:
            1. Only mount & play MediaViewer when isItemActive (isFocused && index === activeIndex).
            2. When user switches tabs, isFocused becomes false -> player instantly pauses/unmounts!
            3. Inactive cards show cached thumbnail with play badge.
          */}
          {isItemActive ? (
            <MediaViewer
              videoUrl={item.videoUrl}
              isActive={isFocused}
              showControls={false}
              style={styles.mediaViewer}
            />
          ) : (
            <View style={styles.thumbnailWrapper}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.thumbnailCover}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.inactiveBackdrop} />
              <View style={styles.playIconOverlay}>
                <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          )}

          {/* Right Floating Engagement Stack */}
          <View style={[styles.actionStack, { bottom: insets.bottom + 92 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleLike(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, isLiked && styles.actionLiked]}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isLiked ? '#EF4444' : '#FFFFFF'}
                />
              </View>
              <Text style={styles.actionLabel}>
                {isLiked ? (item.viewsCount + 1).toLocaleString() : item.viewsCount.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                toggleBookmark({
                  id: item.id,
                  title: item.title,
                  summary: item.title,
                  content: item.title,
                  category: item.category,
                  categoryId: item.category.toLowerCase(),
                  imageUrl: item.thumbnailUrl,
                  author: item.author,
                  publishedAt: item.publishedAt,
                  readingTimeMinutes: 1,
                  isBreaking: false,
                  viewsCount: item.viewsCount,
                  source: 'स्वराज डिजिटल वीडियो',
                  tags: ['Shorts', item.category],
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={bookmarked ? '#FF8038' : '#FFFFFF'}
                />
              </View>
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name="share-social" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Vernacular Details Overlay */}
          <View style={[styles.detailsOverlay, { bottom: insets.bottom + 85 }]}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{item.category}</Text>
              </View>
              <Text style={styles.authorBadge}>@{item.author.replace(/\s+/g, '')}</Text>
            </View>

            <Text style={styles.shortTitle} numberOfLines={3}>
              {item.title}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color="#94A3B8" />
              <Text style={styles.timeTag}>
                {item.publishedAt} • {item.duration}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [isFocused, activeIndex, likedShorts, isBookmarked, insets.bottom, toggleBookmark]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header Bar with Live TV Quick Access */}
      <View style={[styles.topHeader, { top: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>SWARAJ MP SHORTS</Text>
          <View style={styles.shortsBadge}>
            <Text style={styles.shortsBadgeText}>मप्र फास्ट न्यूज़</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.liveNavButton}
          onPress={() => navigation.navigate('Videos')}
          activeOpacity={0.8}
        >
          <View style={styles.pulseDot} />
          <Text style={styles.liveNavText}>LIVE TV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={SHORTS_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  shortContainer: {
    width: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#000000',
  },
  mediaViewer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  thumbnailWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  thumbnailCover: {
    width: '100%',
    height: '100%',
  },
  inactiveBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playIconOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  shortsBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shortsBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  liveNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveNavText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionStack: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    gap: 18,
    zIndex: 15,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLiked: {
    borderColor: '#EF4444',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailsOverlay: {
    position: 'absolute',
    left: 16,
    right: 80,
    zIndex: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  authorBadge: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shortTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeTag: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
