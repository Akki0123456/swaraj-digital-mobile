import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeColors } from './src/hooks/useThemeColors';
import { usePushNotification } from './src/hooks/usePushNotification';
import { RootStackParamList } from './src/types/navigation';

// Production React Query Client matching 300s TTL cache strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (300 seconds)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

// Deep Link Routing Configuration adhering to TC-MOB-02 & Section 5
// URL Pattern: swaraj://article/:id
const linking = {
  prefixes: ['swaraj://', 'https://swarajdigital.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Feed: 'feed',
          Shorts: 'shorts',
          Videos: 'videos',
          Bookmarks: 'bookmarks',
          Settings: 'settings',
        },
      },
      ArticleDetail: 'article/:id',
      CategoryDetail: 'category/:category',
      Search: 'search',
      Login: 'login',
      Signup: 'signup',
    },
  },
};

function AppContent() {
  const { isDark, colors, brandColors } = useThemeColors();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // APNs & FCM Lifecycle Listener (Cold Start / Background / Foreground)
  usePushNotification(navigationRef);

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: brandColors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: brandColors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
        },
      };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <NavigationContainer ref={navigationRef} theme={navigationTheme} linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
