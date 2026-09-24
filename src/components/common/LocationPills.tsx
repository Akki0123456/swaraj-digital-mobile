import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LOCATION_FILTERS, LocationFilter } from '../../constants/locations';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SPACING, RADIUS } from '../../constants/theme';

interface LocationPillsProps {
  selectedLocationId: string;
  onSelectLocation: (location: LocationFilter) => void;
}

export const LocationPills: React.FC<LocationPillsProps> = ({
  selectedLocationId,
  onSelectLocation,
}) => {
  const { colors, brandColors } = useThemeColors();
  const { language } = useSettingsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeLocation = LOCATION_FILTERS.find((l) => l.id === selectedLocationId) || LOCATION_FILTERS[0];

  const filteredLocations = LOCATION_FILTERS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      loc.hindiName.includes(searchQuery.trim()) ||
      loc.queryTerm.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (loc: LocationFilter) => {
    onSelectLocation(loc);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleCustomCitySearch = () => {
    if (!searchQuery.trim()) return;
    const customLoc: LocationFilter = {
      id: `custom-${Date.now()}`,
      name: searchQuery.trim(),
      hindiName: searchQuery.trim(),
      queryTerm: searchQuery.trim(),
      type: 'city',
    };
    onSelectLocation(customLoc);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <View style={styles.headerLabelRow}>
        <View style={styles.labelLeft}>
          <Ionicons name="location-sharp" size={14} color={brandColors.primary} />
          <Text style={[styles.headerLabelText, { color: colors.textSecondary }]}>
            {language === 'hi' ? 'स्थान व राज्य चुनें' : 'STATE & CITY LOCATION'}
          </Text>
        </View>

        {/* Search City Button */}
        <TouchableOpacity
          style={[styles.searchCityTrigger, { backgroundColor: colors.tagBg, borderColor: colors.border }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="search-outline" size={13} color={brandColors.primary} />
          <Text style={[styles.searchCityTriggerText, { color: colors.text }]}>
            {language === 'hi' ? 'शहर/राज्य खोजें' : 'Search City'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {LOCATION_FILTERS.map((loc) => {
          const isSelected = loc.id === selectedLocationId;
          return (
            <TouchableOpacity
              key={loc.id}
              style={[
                styles.pill,
                isSelected
                  ? { backgroundColor: brandColors.primary, borderColor: brandColors.primary }
                  : { backgroundColor: colors.tagBg, borderColor: colors.border },
              ]}
              onPress={() => onSelectLocation(loc)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isSelected ? 'location' : 'location-outline'}
                size={13}
                color={isSelected ? '#FFFFFF' : brandColors.primary}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextActive : { color: colors.text },
                ]}
              >
                {loc.name}
              </Text>
              <Text
                style={[
                  styles.hindiSub,
                  isSelected ? { color: '#FFE4D6' } : { color: colors.textSecondary },
                ]}
              >
                ({loc.hindiName})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* City & State Search Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Top Bar */}
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'hi' ? 'राज्य या शहर चुनें' : 'Select State or City'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Input Box */}
          <View style={styles.modalSearchWrapper}>
            <View style={[styles.modalInputBox, { backgroundColor: colors.tagBg, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.modalInput, { color: colors.text }]}
                placeholder={language === 'hi' ? 'शहर का नाम लिखें (उदा. भोपाल, इंदौर, उज्जैन)...' : 'Type city or state (e.g. Bhopal, Indore, Rewa)...'}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick State Tags */}
          {searchQuery.trim().length === 0 && (
            <View style={styles.stateTagsSection}>
              <Text style={[styles.stateTagsTitle, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'प्रमुख राज्य और क्षेत्र' : 'FEATURED STATES & REGIONS'}
              </Text>
              <View style={styles.stateTagsGrid}>
                {['Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Delhi NCR', 'Rajasthan', 'Bihar', 'Gujarat'].map((st) => {
                  const locObj = LOCATION_FILTERS.find((l) => l.name === st);
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.stateTagBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => locObj && handleSelect(locObj)}
                    >
                      <Ionicons name="map" size={14} color={brandColors.primary} />
                      <Text style={[styles.stateTagText, { color: colors.text }]}>{st}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Location List */}
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              searchQuery.trim().length > 0 && filteredLocations.length === 0 ? (
                <TouchableOpacity
                  style={[styles.customCityCard, { backgroundColor: brandColors.primary + '18', borderColor: brandColors.primary }]}
                  onPress={handleCustomCitySearch}
                >
                  <Ionicons name="search-circle" size={24} color={brandColors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.customCityTitle, { color: brandColors.primary }]}>
                      Search live news for "{searchQuery.trim()}"
                    </Text>
                    <Text style={[styles.customCitySub, { color: colors.textSecondary }]}>
                      Tap to fetch real-time news for {searchQuery.trim()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item }) => {
              const isSelected = item.id === activeLocation.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.locationRow,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: brandColors.primary + '10' },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={[styles.rowIcon, { backgroundColor: isSelected ? brandColors.primary : colors.tagBg }]}>
                    <Ionicons
                      name={item.type === 'state' ? 'map' : item.type === 'all' ? 'globe' : 'business'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : brandColors.primary}
                    />
                  </View>
                  <View style={styles.rowTextGroup}>
                    <Text style={[styles.rowName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.rowHindi, { color: colors.textSecondary }]}>{item.hindiName}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={brandColors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
  },
  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: 6,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLabelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  searchCityTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    gap: 4,
  },
  searchCityTriggerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  hindiSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSearchWrapper: {
    padding: SPACING.lg,
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
  },
  stateTagsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  stateTagsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  stateTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  stateTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  customCityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: 12,
  },
  customCityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  customCitySub: {
    fontSize: 12,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextGroup: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowHindi: {
    fontSize: 12,
    marginTop: 2,
  },
});
