import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  AppState,
  AppStateStatus,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING } from '../constants/theme';

export interface MediaViewerProps {
  videoUrl: string;
  isLive?: boolean;
  isActive?: boolean;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  showControls?: boolean;
  allowsFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * Helper to identify if a URL is a YouTube stream/video/shorts
 */
const isYouTubeSource = (url: string): boolean => {
  return /youtube\.com|youtu\.be/i.test(url);
};

/**
 * Format YouTube URL into a responsive, mobile-ready embed URL
 * Handles /shorts/, watch?v=, youtu.be/, and channel live_stream
 */
const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('/embed/')) {
    const hasParams = url.includes('?');
    return `${url}${hasParams ? '&' : '?'}autoplay=1&mute=0&controls=1&playsinline=1&modestbranding=1&rel=0`;
  }

  // Channel Live stream: e.g. channel ID query
  const channelMatch = url.match(/channel[=/]([a-zA-Z0-9_-]+)/);
  if (channelMatch && channelMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=1&mute=0&controls=1&playsinline=1&modestbranding=1&rel=0`;
  }

  // Standard watch?v=ID, youtu.be/ID or shorts/ID
  const videoIdMatch = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]*)/);
  if (videoIdMatch && videoIdMatch[1] && videoIdMatch[1].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${videoIdMatch[1]}?autoplay=1&mute=0&controls=1&playsinline=1&modestbranding=1&rel=0`;
  }

  return url;
};

/**
 * YouTube Embed Player subcomponent using WebView.
 * When isActive is false (e.g. tab changed or scrolled away),
 * it unmounts the WebView to immediately kill audio/video in background.
 */
const YouTubeViewer: React.FC<{
  videoUrl: string;
  isLive?: boolean;
  isActive?: boolean;
  style?: ViewStyle;
}> = ({ videoUrl, isLive, isActive = true, style }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);

  // Tab change / Inactive safety: do not run WebView in background
  if (!isActive) {
    return <View style={[styles.container, style]} />;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: #000000;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <iframe
          src="${embedUrl}"
          title="Swaraj News Broadcast"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: htmlContent, baseUrl: 'https://www.swarajdigital.in' }}
        style={styles.webView}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setLoadError(true);
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF8038" />
          <Text style={styles.loadingText}>Connecting to Swaraj News...</Text>
        </View>
      )}

      {loadError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load Swaraj Broadcast</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadError(false);
              setLoading(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLive && (
        <View style={styles.liveBadgeOverlay} pointerEvents="none">
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>SWARAJ 24X7 LIVE</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Direct native video subcomponent using expo-video (HLS / MP4).
 * Uses textureView on Android for smooth FlatList list recycling.
 * Listens to isActive and AppState to pause instantly on tab change or background.
 */
const NativeVideoPlayer: React.FC<{
  videoUrl: string;
  isLive?: boolean;
  isActive?: boolean;
  style?: ViewStyle;
  showControls?: boolean;
}> = ({ videoUrl, isLive = false, isActive = true, style, showControls = true }) => {
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = !isLive;
    if (isActive) {
      p.play();
    } else {
      p.pause();
    }
  });

  // Listen to status changes & error events
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'error') {
        setHasPlaybackError(true);
      } else if (payload.status === 'readyToPlay') {
        setHasPlaybackError(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [player]);

  // Active / Inactive lifecycle (pauses instantly when tab changes or scrolled past)
  useEffect(() => {
    if (!player) return;
    if (isActive && !hasPlaybackError) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player, hasPlaybackError]);

  // App background / foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (!player) return;
      if (nextAppState === 'active' && isActive && !hasPlaybackError) {
        player.play();
      } else {
        player.pause();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, isActive, hasPlaybackError]);

  const handleRetry = () => {
    setHasPlaybackError(false);
    setRetryKey((prev) => prev + 1);
    if (player) {
      player.replay();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <VideoView
        key={`video-view-${retryKey}`}
        player={player}
        style={styles.video}
        nativeControls={showControls}
        allowsPictureInPicture
        contentFit="cover"
        surfaceType="textureView"
      />

      {isLive && (
        <View style={styles.liveBadgeOverlay}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>SWARAJ 24X7 LIVE</Text>
        </View>
      )}

      {hasPlaybackError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          <Text style={styles.errorText}>Stream buffering or connection interrupted</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry Stream</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/**
 * Universal High-Performance MediaViewer
 * Supports:
 * - Native HLS (.m3u8) & MP4 playback with hardware decoders
 * - Official YouTube Live broadcasts & videos with responsive webview
 * - Immediate pausing on Tab Change and background transitions
 */
export const MediaViewer: React.FC<MediaViewerProps> = ({
  videoUrl,
  isLive = false,
  isActive = true,
  title,
  subtitle,
  style,
  showControls = true,
}) => {
  const isYouTube = isYouTubeSource(videoUrl);

  return (
    <View style={[styles.wrapper, style]}>
      {isYouTube ? (
        <YouTubeViewer
          videoUrl={videoUrl}
          isLive={isLive}
          isActive={isActive}
          style={style}
        />
      ) : (
        <NativeVideoPlayer
          videoUrl={videoUrl}
          isLive={isLive}
          isActive={isActive}
          style={style}
          showControls={showControls}
        />
      )}

      {(title || subtitle) && (
        <View style={styles.overlayBottom} pointerEvents="none">
          {title && (
            <Text style={styles.overlayTitle} numberOfLines={2}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.overlaySubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  liveBadgeOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    zIndex: 10,
    elevation: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    gap: 12,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    zIndex: 25,
    gap: 8,
  },
  errorText: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
    gap: 6,
    marginTop: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 12,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  overlaySubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 4,
  },
});
