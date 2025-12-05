import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../../context/AppContext';

interface ISBNDisplayProps {
  theme: Theme;
  isbn: string;
  source: string;
}

const ISBNDisplay: React.FC<ISBNDisplayProps> = ({ theme, isbn, source }) => {
  if (!isbn) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        ISBN: {isbn} (from {source})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
  },
});

export default ISBNDisplay;