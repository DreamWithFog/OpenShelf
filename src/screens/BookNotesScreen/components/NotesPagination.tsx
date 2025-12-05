import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface NotesPaginationProps {
  theme: Theme;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const NotesPagination: React.FC<NotesPaginationProps> = ({ theme, currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    }}>
      <TouchableOpacity
        onPress={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{ padding: 8, opacity: currentPage === 1 ? 0.3 : 1 }}
      >
        <MaterialIcons name="first-page" size={24} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ padding: 8, marginHorizontal: 10, opacity: currentPage === 1 ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={{
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 20,
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {currentPage} / {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ padding: 8, marginHorizontal: 10, opacity: currentPage === totalPages ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-right" size={24} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{ padding: 8, opacity: currentPage === totalPages ? 0.3 : 1 }}
      >
        <MaterialIcons name="last-page" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};
