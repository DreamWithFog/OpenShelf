import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../../context/AppContext';

interface CustomLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (language: string) => void;
  theme: Theme;
  value: string;
  onChangeText: (text: string) => void;
  title?: string;
}

const CustomLanguageModal: React.FC<CustomLanguageModalProps> = ({ visible, onClose, onConfirm, theme, value, onChangeText, title }) => {
  const handleSave = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title || 'Enter Custom Language'}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Language"
            placeholderTextColor={theme.textSecondary}
            value={value}
            onChangeText={onChangeText}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={{ color: theme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default CustomLanguageModal;