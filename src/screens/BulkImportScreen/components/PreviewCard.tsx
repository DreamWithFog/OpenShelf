import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';
import { Book, ImportStats } from '../../../types';  // FIX: Import both types

interface PreviewCardProps {
  theme: Theme;
  parsedBooks: Partial<Book>[];  // FIX: Allow Partial<Book>
  importStats: ImportStats;
  detectedSource: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ theme, parsedBooks, importStats, detectedSource }) => (
  <View
    style={[
      styles.previewCard,
      { backgroundColor: theme.cardBackground, borderColor: theme.primary },
    ]}
  >
    <View style={styles.previewHeader}>
      <Ionicons name="checkmark-circle" size={40} color={theme.success} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.previewTitle, { color: theme.text }]}>
          File Parsed Successfully!
        </Text>
        <Text style={[styles.previewSubtitle, { color: theme.textSecondary }]}>
          Source: {detectedSource}
        </Text>
      </View>
    </View>

    {/* Stats */}
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.primary }]}>
          {importStats.totalBooks}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          Books to Import
        </Text>
      </View>

      {importStats.skipped > 0 && (
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.textSecondary }]}>
            {importStats.skipped}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Skipped</Text>
        </View>
      )}
    </View>

    {/* Sample Books */}
    <Text style={[styles.sampleTitle, { color: theme.text }]}>Sample Books:</Text>
    {parsedBooks.slice(0, 5).map((book, index: number) => (
      <View key={index} style={[styles.bookPreview, { borderColor: theme.border }]}>
        <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>
          {book.title || 'Untitled'}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
          {book.author || 'Unknown Author'}
        </Text>
      </View>
    ))}

    {parsedBooks.length > 5 && (
      <Text style={[styles.moreText, { color: theme.textSecondary }]}>
        + {parsedBooks.length - 5} more books...
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  previewCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  bookPreview: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
  },
  moreText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
});
