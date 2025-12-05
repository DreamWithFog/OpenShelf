import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles } from '../../../../styles/globalStyles';

interface NotesHeaderProps {
  theme: { text: string; primary: string };
  totalNotes: number;
  onAddNote: () => void;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({ theme, totalNotes, onAddNote }) => (
  <View style={{ 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15 
  }}>
    <Text style={[globalStyles.subtitle, { color: theme.text }]}>
      Notes & Quotes {totalNotes > 0 && `(${totalNotes})`}
    </Text>
    <TouchableOpacity
      style={{
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
      }}
      onPress={onAddNote}
    >
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
        Add
      </Text>
    </TouchableOpacity>
  </View>
);

export default NotesHeader;