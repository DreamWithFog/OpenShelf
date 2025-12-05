import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons'; // Added Icon
import { sanitizeInput } from '../../utils/helpers';
import * as Linking from 'expo-linking';
import { Book, FormState } from '../../types';

interface BookDetailInfoProps {
  book: Book | null;
  bookState: FormState;
  dispatch: React.Dispatch<any>;
  isEditing: boolean;
  theme: {
    inputBackground: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    cardBackground: string;
  };
  currentReadPage: number;
}

const BookDetailInfo: React.FC<BookDetailInfoProps> = ({
  book,
  bookState,
  dispatch,
  isEditing,
  theme,
  currentReadPage
}) => {
  if (isEditing) {
    // ... (Keep existing edit mode inputs) ...
    return (
      <>
        {/* Use previous Input code here... omitting for brevity but assuming you keep it */}
        <TextInput style={[globalStyles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, marginBottom: 15 }]} value={bookState.title} onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'title', value: sanitizeInput(value) })} placeholder="Book Title" placeholderTextColor={theme.textSecondary} />
        <TextInput style={[globalStyles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, marginBottom: 15 }]} value={bookState.author} onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'author', value: sanitizeInput(value) })} placeholder="Author" placeholderTextColor={theme.textSecondary} />
        <TextInput style={[globalStyles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, marginBottom: 15 }]} value={bookState.bookUrl} onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'bookUrl', value: sanitizeInput(value) })} placeholder="Book URL" placeholderTextColor={theme.textSecondary} keyboardType="url" />
        <TextInput style={[globalStyles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, marginBottom: 15 }]} value={bookState.totalPages?.toString()} onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalPages', value })} placeholder="Total Pages" placeholderTextColor={theme.textSecondary} keyboardType="number-pad" />
      </>
    );
  }

  return (
    <>
      <Text style={[globalStyles.title, { color: theme.text, textAlign: 'center', marginBottom: 8 }]}>
        {book?.title || 'Untitled'}
      </Text>
      <Text style={[globalStyles.body, { color: theme.textSecondary, textAlign: 'center', marginBottom: 8 }]}>
        by {book?.author || 'Unknown Author'}
      </Text>
      
      {/* Badges Container */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        {/* Translation Badge */}
        {book?.originalLanguage && book?.language && book.originalLanguage !== book.language && (
          <View style={{ backgroundColor: theme.cardBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
              {book.originalLanguage} → {book.language}
            </Text>
          </View>
        )}

        {/* NEW: Re-read Badge */}
        {(book?.readCount || 0) > 0 && (
          <View style={{ backgroundColor: `${theme.primary}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
             <MaterialIcons name="repeat" size={14} color={theme.primary} style={{ marginRight: 4 }} />
             <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>
               Read {book?.readCount}x
             </Text>
          </View>
        )}
      </View>

      {/* Progress Text */}
      {(book?.totalPages || 0) > 0 && (
        <Text style={[globalStyles.body, { color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }]}>
          {currentReadPage > 0 ? `${currentReadPage} / ` : ''}{book?.totalPages} pages
        </Text>
      )}

      {/* ... (Rest of Visit Site button & Info Table remains same) ... */}
      {book?.bookUrl && book.bookUrl.trim() !== '' && (
        <TouchableOpacity style={{ backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16, alignItems: 'center' }} onPress={() => Linking.openURL(book.bookUrl!)}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Visit Book Site</Text>
        </TouchableOpacity>
      )}

      <View style={{ backgroundColor: theme.cardBackground, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 12 }}>Information</Text>
        {/* ... (Table rows for Format, Language etc. keep existing code) ... */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Format</Text>
          <Text style={{ color: theme.text, fontSize: 14, fontWeight: '500' }}>{book?.format || 'Physical'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Language</Text>
          <Text style={{ color: theme.text, fontSize: 14, fontWeight: '500' }}>{book?.language || 'English'}</Text>
        </View>
      </View>
    </>
  );
};

export default BookDetailInfo;
