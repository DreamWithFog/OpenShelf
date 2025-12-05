import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { EdgeInsets } from 'react-native-safe-area-context';
import { BOOK_FORMATS } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface FormatPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (format: string) => void;
  theme: Theme;
  currentFormat?: string;
  insets?: EdgeInsets;
}

const FormatPickerModal: React.FC<FormatPickerModalProps> = ({ 
  visible, 
  onClose, 
  onSelect, 
  theme,
  currentFormat 
}) => {
  const handleSelect = (format: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(format);
    onClose(); // Auto-close after selection
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Select Format
          </Text>
          
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {BOOK_FORMATS.map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.option,
                  { 
                    backgroundColor: currentFormat === format ? `${theme.primary}20` : 'transparent',
                    borderBottomColor: theme.border 
                  }
                ]}
                onPress={() => handleSelect(format)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText, 
                  { 
                    color: currentFormat === format ? theme.primary : theme.text,
                    fontWeight: currentFormat === format ? '600' : 'normal'
                  }
                ]}>
                  {format}
                </Text>
                {currentFormat === format && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.border }]} 
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FormatPickerModal;
