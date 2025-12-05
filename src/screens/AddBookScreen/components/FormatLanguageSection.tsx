import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';

interface FormatLanguageSectionProps {
  theme: Theme;
  book: {
    format: string;
    language: string;
    originalLanguage: string;
  };
  setShowFormatPicker: (show: boolean) => void;
  setShowLanguagePicker: (show: boolean) => void;
  setShowOriginalLanguagePicker: (show: boolean) => void;
}

const FormatLanguageSection: React.FC<FormatLanguageSectionProps> = ({ 
  theme, 
  book, 
  setShowFormatPicker, 
  setShowLanguagePicker,
  setShowOriginalLanguagePicker 
}) => {
  return (
    <View style={styles.container}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Format & Language
      </Text>
      
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        onPress={() => setShowFormatPicker(true)}
      >
        <Text style={{ color: theme.text }}>Format: {book.format || 'Physical'}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        onPress={() => setShowLanguagePicker(true)}
      >
        <Text style={{ color: theme.text }}>Language: {book.language || 'English'}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
        onPress={() => setShowOriginalLanguagePicker(true)}
      >
        <Text style={{
          color: book.originalLanguage ? theme.text : theme.textSecondary
        }}>
          {book.originalLanguage 
            ? `Original: ${book.originalLanguage}` 
            : 'Original Language (if translated)'
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
});

export default FormatLanguageSection;
