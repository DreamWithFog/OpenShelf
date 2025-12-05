import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../../context/AppContext';

interface FilterBarProps {
  activeFiltersCount: number;
  onShowFilterModal: () => void;
  onClearFilters: () => void;
  onShowViewPicker: () => void;
  theme: Theme;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFiltersCount,
  onShowFilterModal,
  onClearFilters,
  onShowViewPicker,
  theme
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={onShowFilterModal}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.cardBackground,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: activeFiltersCount > 0 ? theme.primary : theme.border,
          }}
        >
          <MaterialIcons
            name="filter-list"
            size={18}
            color={activeFiltersCount > 0 ? '#fff' : theme.text}
          />
          {activeFiltersCount > 0 && (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 6,
            }}>
              <Text style={{
                color: theme.primary,
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {activeFiltersCount > 0 && (
          <TouchableOpacity
            onPress={() => {
              onClearFilters();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            style={{
              backgroundColor: theme.cardBackground,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 14 }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={onShowViewPicker}
        style={{
          backgroundColor: theme.cardBackground,
          padding: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Feather name="grid" size={18} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};
