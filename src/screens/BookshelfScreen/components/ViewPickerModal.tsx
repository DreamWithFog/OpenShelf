import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GRID_VIEWS } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface ViewPickerModalProps {
  visible: boolean;
  gridView: string;
  onSelectView: (view: string) => void;
  onClose: () => void;
  theme: Theme;
}

export const ViewPickerModal: React.FC<ViewPickerModalProps> = ({ visible, gridView, onSelectView, onClose, theme }) => {
  const gridViewOptions: { key: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: GRID_VIEWS.COMFORTABLE, label: 'Comfortable', icon: 'grid' },
    { key: GRID_VIEWS.COMPACT, label: 'Compact', icon: 'grid' },
    { key: GRID_VIEWS.DETAILED, label: 'Detailed', icon: 'list' },
    { key: GRID_VIEWS.STACK, label: 'Carousel', icon: 'layers' },
  ];

  if (!visible) return null;

  return (
    <>
      {/* Backdrop to close modal */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Modal Content */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          right: 16,
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 8,
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        accessible={true}
        accessibilityLabel="View layout options"
        accessibilityRole="menu"
      >
        {gridViewOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              backgroundColor: gridView === option.key ? theme.primary : 'transparent',
              borderRadius: 8,
              marginVertical: 2,
              gap: 10,
            }}
            onPress={() => onSelectView(option.key)}
            accessible={true}
            accessibilityLabel={`${option.label} view`}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: gridView === option.key }}
          >
            <Feather
              name={option.icon}
              size={18}
              color={gridView === option.key ? '#fff' : theme.text}
            />
            <Text style={{
              color: gridView === option.key ? '#fff' : theme.text,
              fontWeight: gridView === option.key ? 'bold' : 'normal'
            }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};
