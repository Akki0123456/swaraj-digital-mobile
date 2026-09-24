import { useEffect, useCallback } from 'react';
import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export interface PushNotificationPayload {
  articleId?: string;
  slug?: string;
  category?: string;
  route?: string;
  [key: string]: any;
}

/**
 * Safely checks if Firebase native module is actually compiled into the current binary.
 * Prevents "Native module NativeRNFBTurboApp is not registered" fatal error in Expo Go or development builds.
 */
function isNativeFirebaseAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    // React Native New Architecture TurboModule check (non-enforcing)
    const turboApp = (TurboModuleRegistry as any)?.get?.('NativeRNFBTurboApp');
    // Legacy Bridge check
    const legacyApp = NativeModules?.RNFBAppModule || NativeModules?.RNFBMessagingModule;
    return Boolean(turboApp || legacyApp);
  } catch {
    return false;
  }
}

/**
 * APNs & FCM lifecycle listener adhering to TC-MOB-02 & Section 5 push contract.
 * Listens for:
 * 1. Quit State (App terminated): getInitialNotification() -> direct navigation to ArticleDetail
 * 2. Background State: onNotificationOpenedApp()
 * 3. Foreground State: onMessage()
 */
export function usePushNotification(
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>
) {
  const handleNotificationRoute = useCallback(
    (data?: PushNotificationPayload) => {
      if (!data) return;
      const articleId = data.articleId || data.id;

      const isReady = navigationRef.isReady ? navigationRef.isReady() : (navigationRef as any).current?.isReady?.();
      if (articleId && isReady) {
        // Construct a lean placeholder article for instant navigation, then fetched by ID
        const targetArticle = {
          id: articleId,
          title: data.title || 'Breaking Alert',
          summary: data.summary || 'Loading breaking story...',
          content: data.content || '',
          category: data.category || 'Breaking',
          categoryId: data.category?.toLowerCase() || 'all',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
          author: 'Swaraj Digital Newsdesk',
          publishedAt: 'Just now',
          readingTimeMinutes: 2,
          isBreaking: true,
          viewsCount: 1,
          source: 'Swaraj Digital',
          tags: ['Breaking', 'Alert'],
        };

        (navigationRef as any).navigate('ArticleDetail', {
          article: targetArticle,
        });
      }
    },
    [navigationRef]
  );

  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeBackground: (() => void) | undefined;

    async function initFirebaseMessaging() {
      // Guard: Do not load Firebase JS module if native TurboModule is not linked in binary
      if (!isNativeFirebaseAvailable()) {
        console.log(
          '[Push Notification] Native Firebase module not detected in this APK/binary. Running in development fallback mode.'
        );
        return;
      }

      try {
        const messagingModule = require('@react-native-firebase/messaging');
        const messaging = messagingModule.default || messagingModule;

        // Request permission on iOS / Android 13+
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          // Subscribe to topic all_news (Section 3.5 & 5.1 Push Dispatcher Contract)
          await messaging().subscribeToTopic('all_news');

          // 1. Quit state notification tap
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification?.data) {
            setTimeout(() => {
              handleNotificationRoute(initialNotification.data as PushNotificationPayload);
            }, 600);
          }

          // 2. Background state notification tap
          unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage: any) => {
            if (remoteMessage?.data) {
              handleNotificationRoute(remoteMessage.data as PushNotificationPayload);
            }
          });

          // 3. Foreground message listener
          unsubscribeForeground = messaging().onMessage(async (remoteMessage: any) => {
            console.log('FCM Foreground Alert received:', remoteMessage.notification?.title);
          });
        }
      } catch (err) {
        console.log('[Push Notification] Listener active in fallback mode:', (err as Error).message);
      }
    }

    initFirebaseMessaging();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackground) unsubscribeBackground();
    };
  }, [handleNotificationRoute]);

  return {
    handleNotificationRoute,
  };
}
