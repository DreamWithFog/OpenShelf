import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { EditableStarRating } from '../../../components';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';

interface BasicInfoSectionProps {
  theme: Theme;
  book: {
    title: string;
    author: string;
    publisher: string;
    publicationYear: string;
    isbn: string;
    bookUrl: string;
    rating: number;
  };
  handleInputChange: (field: string, value: string | number) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ theme, book, handleInputChange }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Basic Information
      </Text>
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="Book Title *"
        placeholderTextColor={theme.textSecondary}
        value={book.title}
        onChangeText={(text) => handleInputChange('title', text)}
        maxLength={500}
      />
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="Author"
        placeholderTextColor={theme.textSecondary}
        value={book.author}
        onChangeText={(text) => handleInputChange('author', text)}
        maxLength={300}
      />
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="Publisher"
        placeholderTextColor={theme.textSecondary}
        value={book.publisher}
        onChangeText={(text) => handleInputChange('publisher', text)}
        maxLength={300}
      />
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="Publication Year"
        placeholderTextColor={theme.textSecondary}
        value={book.publicationYear}
        onChangeText={(text) => handleInputChange('publicationYear', text)}
        keyboardType="numeric"
        maxLength={4}
      />
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="ISBN"
        placeholderTextColor={theme.textSecondary}
        value={book.isbn}
        onChangeText={(text) => handleInputChange('isbn', text)}
        maxLength={20}
      />
      
      <TextInput
        style={[globalStyles.input, { backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 15 }]}
        placeholder="Book URL (Goodreads, Amazon, etc.)"
        placeholderTextColor={theme.textSecondary}
        value={book.bookUrl}
        onChangeText={(text) => handleInputChange('bookUrl', text)}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={1000}
      />
      
      <EditableStarRating
        rating={book.rating}
        onRatingChange={(rating: number) => handleInputChange('rating', rating)}
        theme={theme}
      />
    </View>
  );
};

export default BasicInfoSection;
