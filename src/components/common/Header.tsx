import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TRANSLATIONS } from '../../constants/translations';
import { SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HeaderProps {
  onPressSearch?: () => void;
  onPressBookmarks?: () => void;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onPressSearch,
  title,
  subtitle,
  showSearch = true,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, brandColors } = useThemeColors();
  const { user, isLoggedIn } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const formattedDate = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <View style={[styles.container, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <View style={styles.brandContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t.live}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>
        <Text style={styles.mainTitle}>
          {title ? (
            <Text style={[styles.customTitle, { color: colors.text }]}>{title}</Text>
          ) : (
            <>
              <Text style={styles.titleSwaraj}>SWARAJ</Text>
              <Text style={[styles.titleDigital, { color: colors.text }]}> DIGITAL</Text>
            </>
          )}
        </Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>

      <View style={styles.headerRightActions}>
        <TouchableOpacity
          style={[styles.langPill, { backgroundColor: colors.tagBg, borderColor: colors.border }]}
          onPress={toggleLanguage}
          activeOpacity={0.8}
          accessibilityLabel="Switch Language"
        >
          <Text style={[styles.langPillText, { color: brandColors.primary }]}>
            {language === 'en' ? 'हिन्दी' : 'ENG'}
          </Text>
        </TouchableOpacity>

        {showSearch && onPressSearch && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.tagBg, borderColor: colors.border }]}
            onPress={onPressSearch}
            activeOpacity={0.7}
            accessibilityLabel="Search news"
          >
            <Ionicons name="search" size={18} color={brandColors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.userPill,
            isLoggedIn
              ? { backgroundColor: brandColors.primary + '18', borderColor: brandColors.primary }
              : { backgroundColor: brandColors.primary, borderColor: brandColors.primary },
          ]}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('MainTabs', { screen: 'Settings' });
            } else {
              navigation.navigate('Login');
            }
          }}
          activeOpacity={0.85}
          accessibilityLabel={isLoggedIn ? 'User Account' : 'Sign In'}
        >
          {isLoggedIn && user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarMini} />
          ) : (
            <Ionicons
              name={isLoggedIn ? 'person-circle' : 'person-circle-outline'}
              size={18}
              color={isLoggedIn ? brandColors.primary : '#FFFFFF'}
            />
          )}
          <Text
            style={[
              styles.userPillText,
              { color: isLoggedIn ? brandColors.primary : '#FFFFFF' },
            ]}
            numberOfLines={1}
          >
            {isLoggedIn ? user?.name.split(' ')[0] : t.signIn}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  titleSwaraj: {
    color: '#E65100', // Saffron brand
    fontWeight: '900',
  },
  titleDigital: {
    fontWeight: '800',
  },
  customTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    maxWidth: 100,
  },
  userPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  avatarMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
