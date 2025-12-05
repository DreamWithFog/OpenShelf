import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../styles/globalStyles';

interface BookDetailHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onBack: () => void;
  theme: { background: string; cardBackground: string; text: string; border: string; primary: string };
}

const BookDetailHeader: React.FC<BookDetailHeaderProps> = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onBack,
  theme
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.headerContainer, 
      { 
        backgroundColor: theme.background 
      }
    ]}>
      <View style={styles.headerContent}>
        {/* Back Button - Always visible on left */}
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onBack) onBack();
          }}
          style={[styles.backButton, { backgroundColor: theme.cardBackground }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Right Side Buttons */}
        {isEditing ? (
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCancel();
              }}
              style={[styles.headerButton, styles.cancelButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSave();
              }}
              style={[styles.headerButton, styles.saveButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEdit();
              }}
              style={[styles.iconButton, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDelete();
              }}
              style={[styles.iconButton, styles.deleteButton]}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set via theme.primary
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
});

export default React.memo(BookDetailHeader);