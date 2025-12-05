import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface NotesEmptyStateProps {
  theme: Theme;
  onAddNote: () => void;
}

export const NotesEmptyState: React.FC<NotesEmptyStateProps> = ({ theme, onAddNote }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  }}>
    <MaterialIcons name="note" size={64} color={theme.textSecondary} />
    <Text style={{
      color: theme.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    }}>
      No Notes Yet
    </Text>
    <Text style={{
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
    }}>
      Start adding notes and quotes from your reading journey
    </Text>
    <TouchableOpacity
      onPress={onAddNote}
      style={{
        backgroundColor: theme.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
        Add Your First Note
      </Text>
    </TouchableOpacity>
  </View>
);
