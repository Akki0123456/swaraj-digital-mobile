import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { COLORS, FONT_SIZES } from '../constants/theme';

export function useThemeColors() {
  const systemScheme = useColorScheme();
  const { themeMode, fontSize } = useSettingsStore();

  const isDark =
    themeMode === 'system'
      ? systemScheme === 'dark'
      : themeMode === 'dark';

  const themeColors = isDark ? COLORS.dark : COLORS.light;
  const fontSizes = FONT_SIZES[fontSize] || FONT_SIZES.md;

  return {
    isDark,
    colors: themeColors,
    brandColors: COLORS,
    fontSizes,
    fontSizeKey: fontSize,
  };
}
