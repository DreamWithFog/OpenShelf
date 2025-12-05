import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import { RootStackParamList } from '../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NotesHeaderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookNotes'>;

interface NotesHeaderProps {
  theme: Theme;
  navigation: NotesHeaderNavigationProp;
  bookTitle: string;
  totalNotes: number;
  onAddNote: () => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({ theme, navigation, bookTitle, totalNotes, onAddNote }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.cardBackground,
  }}>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ padding: 4, marginRight: 12 }}
    >
      <MaterialIcons name="arrow-back" size={24} color={theme.text} />
    </TouchableOpacity>
    <View style={{ flex: 1 }}>
      <Text style={{
        color: theme.text,
        fontSize: 18,
        fontWeight: 'bold'
      }}>
        Reading Notes & Quotes
      </Text>
      <Text style={{
        color: theme.textSecondary,
        fontSize: 14,
        marginTop: 2
      }}>
        {bookTitle} • {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
      </Text>
    </View>
    <TouchableOpacity
      onPress={onAddNote}
      style={{
        backgroundColor: theme.primary,
        padding: 10,
        borderRadius: 20,
      }}
    >
      <MaterialIcons name="add" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);
