import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import { Book } from '../../../types';

interface ActionButtonsProps {
  theme: Theme;
  parsedBooks: Partial<Book>[];  // FIX: Allow Partial<Book>
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  theme,
  parsedBooks,
  isProcessing,
  onConfirm,
  onCancel
}) => (
  <>
    <TouchableOpacity
      style={[styles.confirmButton, { backgroundColor: theme.primary }]}
      onPress={onConfirm}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          <Ionicons name="download-outline" size={24} color="#FFF" />
          <Text style={styles.confirmButtonText}>
            Import {parsedBooks.length} Books
          </Text>
        </>
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.cancelButton, { borderColor: theme.border }]}
      onPress={onCancel}
      disabled={isProcessing}
    >
      <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
    </TouchableOpacity>
  </>
);

const styles = StyleSheet.create({
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
