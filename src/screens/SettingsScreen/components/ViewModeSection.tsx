import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { GRID_VIEWS } from '../../../constants';
import { Theme } from '../../../context/AppContext';

const getViewIcon = (view: string): keyof typeof Ionicons.glyphMap => {
  switch (view) {
    case GRID_VIEWS.COMFORTABLE: return 'grid-outline';
    case GRID_VIEWS.COMPACT: return 'apps-outline';
    case GRID_VIEWS.DETAILED: return 'list-outline';
    case GRID_VIEWS.STACK: return 'albums-outline';
    default: return 'grid-outline';
  }
};

const getViewName = (view: string): string => {
  switch (view) {
    case GRID_VIEWS.COMFORTABLE: return 'Comfortable Grid';
    case GRID_VIEWS.COMPACT: return 'Compact Grid';
    case GRID_VIEWS.DETAILED: return 'Detailed List';
    case GRID_VIEWS.STACK: return 'Carousel';
    default: return 'Comfortable Grid';
  }
};

interface ViewModeSectionProps {
  theme: Theme;
  gridView: string;
  onViewChange: (view: string) => void;
}

export const ViewModeSection: React.FC<ViewModeSectionProps> = ({ theme, gridView, onViewChange }) => (
  <View style={{
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  }}>
    <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 15 }]}>
      Library View
    </Text>

    {Object.values(GRID_VIEWS).map((view) => (
      <TouchableOpacity
        key={view}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: view !== GRID_VIEWS.STACK ? 1 : 0,
          borderBottomColor: theme.border,
        }}
        onPress={() => onViewChange(view)}
        accessible={true}
        accessibilityLabel={`Select ${getViewName(view)}`}
        accessibilityRole="radio"
        accessibilityState={{ selected: gridView === view }}
      >
        <Ionicons
          name={getViewIcon(view)}
          size={24}
          color={gridView === view ? theme.primary : theme.textSecondary}
          style={{ marginRight: 12 }}
        />
        <Text style={[
          globalStyles.body,
          {
            color: gridView === view ? theme.primary : theme.text,
            flex: 1,
            fontWeight: gridView === view ? '600' : '400'
          }
        ]}>
          {getViewName(view)}
        </Text>
        {gridView === view && (
          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
        )}
      </TouchableOpacity>
    ))}
  </View>
);
