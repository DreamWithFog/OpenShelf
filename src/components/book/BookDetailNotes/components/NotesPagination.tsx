import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NotesPaginationProps {
  theme: { text: string; border: string };
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NotesPagination: React.FC<NotesPaginationProps> = ({ theme, currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginTop: 10,
    }}>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ padding: 8, opacity: currentPage === 1 ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={{ 
        color: theme.text, 
        marginHorizontal: 15,
        fontWeight: 'bold' 
      }}>
        {currentPage} / {totalPages}
      </Text>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ padding: 8, opacity: currentPage === totalPages ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-right" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

export default NotesPagination;