import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

export const SourcesList = ({ theme }: { theme: Theme }) => (
  <>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>Supported Sources:</Text>

    {/* Goodreads */}
    <View
      style={[
        styles.sourceCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <Ionicons name="book-outline" size={32} color="#553B2E" />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.sourceName, { color: theme.text }]}>Goodreads</Text>
        <Text style={[styles.sourceInstructions, { color: theme.textSecondary }]}>
          Go to My Books → Import/Export → Export Library
        </Text>
      </View>
    </View>

    {/* StoryGraph */}
    <View
      style={[
        styles.sourceCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <Ionicons name="analytics-outline" size={32} color="#FF6B35" />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.sourceName, { color: theme.text }]}>StoryGraph</Text>
        <Text style={[styles.sourceInstructions, { color: theme.textSecondary }]}>
          Go to Settings → Export Books → Download CSV
        </Text>
      </View>
    </View>

    {/* LibraryThing */}
    <View
      style={[
        styles.sourceCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <Ionicons name="library-outline" size={32} color="#2E7D32" />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.sourceName, { color: theme.text }]}>LibraryThing</Text>
        <Text style={[styles.sourceInstructions, { color: theme.textSecondary }]}>
          Go to More → Export/Import → Export your library
        </Text>
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceInstructions: {
    fontSize: 13,
    lineHeight: 18,
  },
});
