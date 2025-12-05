import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface InstructionsSectionProps {
  theme: Theme;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ theme }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: theme.cardBackground, borderColor: theme.border },
    ]}
  >
    <Ionicons name="information-circle-outline" size={40} color={theme.primary} />
    <Text style={[styles.cardTitle, { color: theme.text }]}>
      Import Books in Bulk
    </Text>
    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
      Import your library from Goodreads, LibraryThing, or StoryGraph using their CSV export files.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
