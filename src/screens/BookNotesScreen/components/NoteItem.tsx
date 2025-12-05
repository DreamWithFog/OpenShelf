import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate } from '../../../utils/helpers';
import { Theme } from '../../../context/AppContext';
import { Note } from '../../../types';

interface NoteItemProps {
  theme: Theme;
  item: Note;
  noteNumber: number;
  onEdit: (item: Note) => void;
  onDelete: (item: Note) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ theme, item, noteNumber, onEdit, onDelete }) => (
  <View style={{
    backgroundColor: theme.cardBackground,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={{
          color: theme.primary,
          fontWeight: 'bold',
          marginRight: 8
        }}>
          #{noteNumber}
        </Text>
        {item.pageNumber && (
          <View style={{
            backgroundColor: theme.primary + '20',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{
              color: theme.primary,
              fontSize: 12,
              fontWeight: '600'
            }}>
              Page {item.pageNumber}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={{ padding: 4 }}
        >
          <MaterialIcons name="edit" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item)}
          style={{ padding: 4 }}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>

    <Text style={{
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 8
    }}>
      {item.note}
    </Text>

    <Text style={{
      color: theme.textSecondary,
      fontSize: 12,
      fontStyle: 'italic'
    }}>
      Added {formatDate(item.createdAt)}
    </Text>
  </View>
);
