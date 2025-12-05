import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate } from '../../../../utils/helpers';
import { Note } from '../../../../types'; // FIX: Import the global Note type
import { Theme } from '../../../../context/AppContext';

interface NoteCardProps {
  theme: Theme;
  note: Note; // FIX: Use the imported Note type
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ theme, note, onEdit, onDelete }) => (
  <View style={{
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  }}>
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: 8 
    }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {note.pageNumber != null && ( // FIX: Check for null/undefined explicitly
          <View style={{
            backgroundColor: theme.primary + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
            marginRight: 8,
          }}>
            <Text style={{ color: theme.primary, fontSize: 11, fontWeight: 'bold' }}>
              p. {note.pageNumber}
            </Text>
          </View>
        )}
        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
          {formatDate(note.createdAt)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => onEdit(note)} style={{ padding: 4 }}>
          <MaterialIcons name="edit" size={16} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(note)} style={{ padding: 4 }}>
          <MaterialIcons name="delete-outline" size={16} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>
    
    <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>
      {note.note}
    </Text>
  </View>
);

export default NoteCard;