import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useSettingsStore, ThemeMode, FontSizeScale, AppLanguage } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { TRANSLATIONS } from '../constants/translations';
import { Header } from '../components/common/Header';
import { SPACING, RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, brandColors } = useThemeColors();
  const { user, isLoggedIn, logout } = useAuthStore();
  const {
    themeMode,
    setThemeMode,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    notificationsEnabled,
    toggleNotifications,
    breakingNewsAlerts,
    toggleBreakingAlerts,
    audioSpeed,
    setAudioSpeed,
  } = useSettingsStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const LANG_OPTIONS: { label: string; lang: AppLanguage; nativeLabel: string }[] = [
    { label: 'English', lang: 'en', nativeLabel: 'English' },
    { label: 'Hindi', lang: 'hi', nativeLabel: 'हिंदी' },
  ];

  const THEME_OPTIONS: { label: string; mode: ThemeMode; icon: string }[] = [
    { label: 'Light', mode: 'light', icon: 'sunny-outline' },
    { label: 'Dark', mode: 'dark', icon: 'moon-outline' },
    { label: 'System', mode: 'system', icon: 'phone-portrait-outline' },
  ];

  const FONT_OPTIONS: { label: string; scale: FontSizeScale; sizePreview: number }[] = [
    { label: 'Small', scale: 'sm', sizePreview: 13 },
    { label: 'Default', scale: 'md', sizePreview: 15 },
    { label: 'Large', scale: 'lg', sizePreview: 17 },
    { label: 'X-Large', scale: 'xl', sizePreview: 19 },
  ];

  const handleOpenInfo = (title: string, msg: string) => {
    Alert.alert(title, msg);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SETTINGS" subtitle="App preferences and reading options" showSearch={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>USER ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {isLoggedIn && user ? (
              <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatar} />
                  <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    <View style={styles.memberBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={brandColors.primary} />
                      <Text style={[styles.memberBadgeText, { color: brandColors.primary }]}>
                        Verified Reader • Member since {user.memberSince}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.logoutBtn, { borderColor: colors.border, backgroundColor: colors.tagBg }]}
                  onPress={() => {
                    logout();
                    Alert.alert('Logged Out', 'You have been logged out.');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                  <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.guestCard}>
                <View style={styles.guestInfo}>
                  <Text style={[styles.guestTitle, { color: colors.text }]}>Welcome to Swaraj Digital</Text>
                  <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                    Log in or sign up to save stories across devices, customize your news feed, and participate in community discussions.
                  </Text>
                </View>

                <View style={styles.guestBtnRow}>
                  <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: brandColors.primary }]}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.loginBtnText}>{t.logIn}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.signupBtn, { borderColor: brandColors.primary, backgroundColor: colors.tagBg }]}
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.signupBtnText, { color: brandColors.primary }]}>{t.signUp}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Language Selection Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>{t.language}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.themeRow}>
              {LANG_OPTIONS.map((item) => {
                const isActive = language === item.lang;
                return (
                  <TouchableOpacity
                    key={item.lang}
                    style={[
                      styles.themeBox,
                      {
                        backgroundColor: isActive ? brandColors.primary : colors.tagBg,
                        borderColor: isActive ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLanguage(item.lang)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="language"
                      size={20}
                      color={isActive ? '#FFFFFF' : colors.text}
                    />
                    <Text
                      style={[
                        styles.themeBoxText,
                        { color: isActive ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {item.nativeLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((item) => {
                const isActive = themeMode === item.mode;
                return (
                  <TouchableOpacity
                    key={item.mode}
                    style={[
                      styles.themeBox,
                      {
                        backgroundColor: isActive ? brandColors.primary : colors.tagBg,
                        borderColor: isActive ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setThemeMode(item.mode)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? '#FFFFFF' : colors.text}
                    />
                    <Text
                      style={[
                        styles.themeBoxText,
                        { color: isActive ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Reading Font Size Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            READING TEXT SIZE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.fontRow}>
              {FONT_OPTIONS.map((item) => {
                const isActive = fontSize === item.scale;
                return (
                  <TouchableOpacity
                    key={item.scale}
                    style={[
                      styles.fontBox,
                      {
                        backgroundColor: isActive ? brandColors.primary : colors.tagBg,
                        borderColor: isActive ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFontSize(item.scale)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.fontPreviewText,
                        { fontSize: item.sizePreview, color: isActive ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      A
                    </Text>
                    <Text
                      style={[
                        styles.fontLabel,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Audio Narration Speed Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            AUDIO NARRATION SPEED
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.fontRow}>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => {
                const isActive = audioSpeed === speed;
                return (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.fontBox,
                      {
                        backgroundColor: isActive ? brandColors.primary : colors.tagBg,
                        borderColor: isActive ? brandColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setAudioSpeed(speed)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.fontPreviewText,
                        { fontSize: 14, color: isActive ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            NOTIFICATIONS & ALERTS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Breaking News Alerts
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Instant push notifications for urgent developments
                </Text>
              </View>
              <Switch
                value={breakingNewsAlerts}
                onValueChange={toggleBreakingAlerts}
                trackColor={{ false: colors.border, true: brandColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Daily News Digest
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Morning summary of top headlines at 8:00 AM
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: brandColors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* About Swaraj Digital Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            ABOUT SWARAJ DIGITAL
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.linkRow, { borderBottomColor: colors.border }]}
              onPress={() =>
                handleOpenInfo(
                  'Editorial Charter',
                  'Swaraj Digital is committed to unbiased, grounded, and fearless journalism for citizens across India and Maharashtra.'
                )
              }
            >
              <Text style={[styles.linkText, { color: colors.text }]}>Editorial Guidelines & Ethics</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, { borderBottomColor: colors.border }]}
              onPress={() =>
                handleOpenInfo(
                  'Privacy Policy',
                  'Your data is protected. Swaraj Digital does not track or sell user browsing history.'
                )
              }
            >
              <Text style={[styles.linkText, { color: colors.text }]}>Privacy & Data Protection</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.linkRow}>
              <Text style={[styles.linkText, { color: colors.text }]}>Application Version</Text>
              <Text style={[styles.versionText, { color: brandColors.primary }]}>v1.0.0 (Expo SDK 57)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
    gap: SPACING.lg,
  },
  section: {},
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  guestCard: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  guestInfo: {
    gap: 4,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  guestSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  guestBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  loginBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  signupBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  themeRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 10,
  },
  themeBox: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
  },
  themeBoxText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fontRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 8,
  },
  fontBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 4,
  },
  fontPreviewText: {
    fontWeight: '800',
  },
  fontLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
