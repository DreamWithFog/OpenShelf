import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../context/AppContext';
import { getAllBooks } from '../../../database/operations/bookOperations';
import { logger } from '../../../../logger';

interface DebugSectionProps {
  theme: any;
}

const DebugSection: React.FC<DebugSectionProps> = ({ theme }) => {
  const { db } = useAppContext();

  const handleListBooks = async () => {
    if (!db) return;
    try {
      const books = await getAllBooks(db);
      if (books.length === 0) {
        Alert.alert('No Books', 'Your database is empty.');
        return;
      }

      // Log full list to terminal for safety
      logger.log('--- BOOK LIST ---');
      books.forEach(b => logger.log(`[${b.id}] ${b.title}`));

      // Show snippet in Alert
      const snippet = books.slice(0, 10).map(b => `[${b.id}] ${b.title.substring(0, 20)}...`).join('\n');
      const msg = books.length > 10 ? snippet + `\n\n...and ${books.length - 10} more (check terminal)` : snippet;
      
      Alert.alert('Book IDs', msg);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch book list');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.header, { color: theme.text }]}>🛠️ Developer Tools</Text>
      
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#607D8B' }]} 
          onPress={handleListBooks}
        >
          <Ionicons name="list" size={18} color="#fff" />
          <Text style={styles.buttonText}>List All Books (DB)</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.note, { color: theme.textSecondary }]}>
        Gamification debug tools have been removed.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default DebugSection;
