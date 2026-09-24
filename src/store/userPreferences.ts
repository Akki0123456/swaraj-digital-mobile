import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_BODY_SIZE, MAX_BODY_SIZE, MIN_BODY_SIZE } from '../theme/typography';

const STORAGE_KEY = '@swaraj_user_preferences_v1';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'hi';

export interface UserPreferencesState {
  // Typography Scaler (TC-MOB-04: Base 16px to Max 26px)
  fontSizeScaler: number;
  language: AppLanguage;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  breakingNewsAlerts: boolean;
  audioSpeed: number;
  isOffline: boolean;
  isHydrated: boolean;

  // Actions
  setFontSizeScaler: (size: number) => void;
  setLanguage: (lang: AppLanguage) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleNotifications: () => void;
  toggleBreakingAlerts: () => void;
  setAudioSpeed: (speed: number) => void;
  setIsOffline: (isOffline: boolean) => void;
  hydratePreferences: () => Promise<void>;
}

export const useUserPreferences = create<UserPreferencesState>((set, get) => ({
  fontSizeScaler: BASE_BODY_SIZE,
  language: 'hi', // Hindi vernacular default for Swaraj Digital
  themeMode: 'light',
  notificationsEnabled: true,
  breakingNewsAlerts: true,
  audioSpeed: 1.0,
  isOffline: false,
  isHydrated: false,

  setFontSizeScaler: (size: number) => {
    const clamped = Math.max(MIN_BODY_SIZE, Math.min(MAX_BODY_SIZE, size));
    set({ fontSizeScaler: clamped });
    saveToStorage(get());
  },

  setLanguage: (language: AppLanguage) => {
    set({ language });
    saveToStorage(get());
  },

  setThemeMode: (themeMode: ThemeMode) => {
    set({ themeMode });
    saveToStorage(get());
  },

  toggleNotifications: () => {
    const updated = !get().notificationsEnabled;
    set({ notificationsEnabled: updated });
    saveToStorage(get());
  },

  toggleBreakingAlerts: () => {
    const updated = !get().breakingNewsAlerts;
    set({ breakingNewsAlerts: updated });
    saveToStorage(get());
  },

  setAudioSpeed: (audioSpeed: number) => {
    set({ audioSpeed });
    saveToStorage(get());
  },

  setIsOffline: (isOffline: boolean) => {
    set({ isOffline });
  },

  hydratePreferences: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        set({
          fontSizeScaler: parsed.fontSizeScaler ?? BASE_BODY_SIZE,
          language: parsed.language ?? 'hi',
          themeMode: parsed.themeMode ?? 'light',
          notificationsEnabled: parsed.notificationsEnabled ?? true,
          breakingNewsAlerts: parsed.breakingNewsAlerts ?? true,
          audioSpeed: parsed.audioSpeed ?? 1.0,
          isHydrated: true,
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load user preferences from AsyncStorage:', e);
    }
    set({ isHydrated: true });
  },
}));

async function saveToStorage(state: UserPreferencesState) {
  try {
    const payload = {
      fontSizeScaler: state.fontSizeScaler,
      language: state.language,
      themeMode: state.themeMode,
      notificationsEnabled: state.notificationsEnabled,
      breakingNewsAlerts: state.breakingNewsAlerts,
      audioSpeed: state.audioSpeed,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to persist user preferences to AsyncStorage:', e);
  }
}

// Automatically trigger hydration on module load
useUserPreferences.getState().hydratePreferences();
