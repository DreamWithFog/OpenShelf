import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Theme {
  textSecondary: string;
  primary: string;
  cardBackground: string;
}

interface NotesEmptyStateProps {
  theme: Theme;
}

const NotesEmptyState: React.FC<NotesEmptyStateProps> = ({ theme }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}10` }]}>
        <MaterialIcons name="edit-note" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        No notes yet
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Capture your favorite quotes and thoughts here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default NotesEmptyState;
