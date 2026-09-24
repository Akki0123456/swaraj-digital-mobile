import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeScale = 'sm' | 'md' | 'lg' | 'xl';
export type AppLanguage = 'en' | 'hi';

interface SettingsState {
  themeMode: ThemeMode;
  fontSize: FontSizeScale;
  language: AppLanguage;
  notificationsEnabled: boolean;
  breakingNewsAlerts: boolean;
  audioSpeed: number;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSizeScale) => void;
  setLanguage: (lang: AppLanguage) => void;
  toggleNotifications: () => void;
  toggleBreakingAlerts: () => void;
  setAudioSpeed: (speed: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'light',
  fontSize: 'md',
  language: 'en',
  notificationsEnabled: true,
  breakingNewsAlerts: true,
  audioSpeed: 1.0,
  setThemeMode: (themeMode) => set({ themeMode }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLanguage: (language) => set({ language }),
  toggleNotifications: () =>
    set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  toggleBreakingAlerts: () =>
    set((state) => ({ breakingNewsAlerts: !state.breakingNewsAlerts })),
  setAudioSpeed: (audioSpeed) => set({ audioSpeed }),
}));
