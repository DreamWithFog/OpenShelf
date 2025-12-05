import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface SelectFileButtonProps {
  theme: Theme;
  onPress: () => void;
  isProcessing: boolean;
}

export const SelectFileButton: React.FC<SelectFileButtonProps> = ({ theme, onPress, isProcessing }) => (
  <TouchableOpacity
    style={[styles.selectButton, { backgroundColor: theme.primary }]}
    onPress={onPress}
    disabled={isProcessing}
  >
    {isProcessing ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <>
        <Ionicons name="cloud-upload-outline" size={24} color="#FFF" />
        <Text style={styles.selectButtonText}>Select CSV File</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
