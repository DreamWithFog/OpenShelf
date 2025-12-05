import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface ImportNoteCardProps {
  theme: Theme;
}

export const ImportNoteCard: React.FC<ImportNoteCardProps> = ({ theme }) => (
  <View
    style={[
      styles.noteCard,
      { backgroundColor: theme.warning + '15', borderColor: theme.warning },
    ]}
  >
    <Ionicons name="alert-circle-outline" size={24} color={theme.warning} />
    <Text style={[styles.noteText, { color: theme.text }]}>
      Note: Cover images from exports may not always be available. You can manually add them later or use the ISBN scanner.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  noteCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
});
