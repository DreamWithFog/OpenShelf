import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';
import { RootStackParamList } from '../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HeaderProps {
  navigation: HeaderNavigationProp;
  theme: Theme;
  activeFiltersCount: number;
  onShowFilterModal: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  navigation,
  theme,
  activeFiltersCount,
  onShowFilterModal,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount
}) => {
  return (
    <View
      style={[
        globalStyles.header, 
        { 
          backgroundColor: theme.background,
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      ]}
      accessible={true}
      accessibilityRole="header"
    >
      {/* Left Side */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity
              onPress={onToggleSelectionMode}
              style={{ marginRight: 12 }}
              accessible={true}
              accessibilityLabel="Exit selection mode"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                {selectedCount} selected
              </Text>
            </View>
          </>
        ) : (
          <Text 
            style={[
              globalStyles.headerTitle, 
              { 
                color: theme.text,
                fontSize: 24,
                fontWeight: 'bold'
              }
            ]}
          >
            OpenShelf
          </Text>
        )}
      </View>

      {/* Right Side */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {!isSelectionMode && (
          <>
            <TouchableOpacity
              style={[globalStyles.headerButton, { backgroundColor: theme.cardBackground, position: 'relative' }]}
              onPress={() => {
                onShowFilterModal();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessible={true}
              accessibilityLabel="Filters and sorting"
              accessibilityRole="button"
            >
              <Feather name="filter" size={20} color={theme.text} />
              {activeFiltersCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: theme.primary,
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.headerButton, { backgroundColor: theme.cardBackground }]}
              onPress={() => {
                navigation.navigate('Stats');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessible={true}
              accessibilityLabel="Statistics"
              accessibilityRole="button"
            >
              <Feather name="bar-chart-2" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.headerButton, { backgroundColor: theme.cardBackground }]}
              onPress={() => {
                navigation.navigate('Settings');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessible={true}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <Feather name="settings" size={20} color={theme.text} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
