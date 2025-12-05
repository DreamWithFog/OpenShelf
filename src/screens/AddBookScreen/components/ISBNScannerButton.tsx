import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface ISBNScannerButtonProps {
  theme: Theme;
  onPress: () => void;
}

const ISBNScannerButton: React.FC<ISBNScannerButtonProps> = ({ theme, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.primary }]}
      onPress={onPress}
    >
      <Ionicons name="barcode-outline" size={24} color="#fff" />
      <Text style={styles.text}>Scan ISBN</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ISBNScannerButton;