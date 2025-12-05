import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CustomTagProps {
  tag: string;
  onPress?: (tag: string) => void;
  selected?: boolean;
  theme: { selectedTag: string; tagBg: string; border: string; tagText: string };
  removable?: boolean;
  onRemove?: (tag: string) => void;
}

const CustomTag: React.FC<CustomTagProps> = ({ tag, onPress, selected, theme, removable, onRemove }) => {
  const handleRemove = (e?: any) => {
    // Stop propagation to parent TouchableOpacity
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove?.(tag);
  };

  return (
    <TouchableOpacity
      style={[
        styles.tag,
        {
          backgroundColor: selected ? theme.selectedTag : theme.tagBg,
          borderColor: selected ? theme.selectedTag : theme.border,
        }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(tag);
      }}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Tag: ${tag}`}
      accessibilityHint={
        removable
          ? `${selected ? 'Selected. ' : ''}Tap to ${selected ? 'deselect' : 'select'}, tap X to remove`
          : `${selected ? 'Selected. ' : ''}Tap to ${selected ? 'deselect' : 'select'}`
      }
      accessibilityRole="button"
      accessibilityState={{ selected: selected }}
    >
      <Text style={[
        styles.tagText,
        { color: selected ? '#fff' : theme.tagText }
      ]}>
        {tag}
      </Text>
      {removable && (
        <TouchableOpacity
          onPress={handleRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.removeButton}
          activeOpacity={0.6}
        >
          <Text
            style={[styles.removeTag, { color: selected ? '#fff' : theme.tagText }]}
          >
            ×
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 4,
    paddingHorizontal: 2,
  },
  removeTag: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});

export default CustomTag;