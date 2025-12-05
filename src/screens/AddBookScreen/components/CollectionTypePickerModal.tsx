import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLLECTION_TYPES } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface CollectionTypePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  theme: Theme;
}

const CollectionTypePickerModal: React.FC<CollectionTypePickerModalProps> = ({ 
  visible, 
  onClose, 
  onSelect, 
  theme 
}) => {
  const handleSelect = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(type);
    onClose(); // Close modal after selection
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
            Select Collection Type
          </Text>
          
          <View style={styles.optionsContainer}>
            {COLLECTION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.option, { borderBottomColor: theme.border }]}
                onPress={() => handleSelect(type.value)}
                activeOpacity={0.7}
              >
                <Ionicons name={type.icon as any} size={24} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {type.label}
                  </Text>
                  {type.description && (
                    <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                      {type.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

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
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CollectionTypePickerModal;
