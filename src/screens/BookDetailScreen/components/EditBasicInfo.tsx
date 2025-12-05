import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';
import { FormState, BookAction } from '../../../types';

interface EditBasicInfoProps {
  bookState: FormState;
  dispatch: React.Dispatch<BookAction>;
  theme: Theme;
}

const EditBasicInfoComponent: React.FC<EditBasicInfoProps> = ({ bookState, dispatch, theme }) => {
  return (
    <View>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10, marginTop: 20 }]}>
        Basic Information
      </Text>

      <TextInput
        placeholder="Book Title *"
        placeholderTextColor={theme.textSecondary}
        style={[
          globalStyles.modalInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
            marginBottom: 15
          }
        ]}
        value={bookState.title}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'title', value })}
        maxLength={500}
      />

      <TextInput
        placeholder="Author"
        placeholderTextColor={theme.textSecondary}
        style={[
          globalStyles.modalInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
            marginBottom: 15
          }
        ]}
        value={bookState.author}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'author', value })}
        maxLength={300}
      />

      <TextInput
        placeholder="Publisher"
        placeholderTextColor={theme.textSecondary}
        style={[
          globalStyles.modalInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
            marginBottom: 15
          }
        ]}
        value={bookState.publisher}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'publisher', value })}
        maxLength={300}
      />

      <TextInput
        placeholder="Publication Year"
        placeholderTextColor={theme.textSecondary}
        style={[
          globalStyles.modalInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
            marginBottom: 15
          }
        ]}
        value={bookState.publicationYear}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'publicationYear', value })}
        keyboardType="numeric"
        maxLength={4}
      />

      <TextInput
        placeholder="ISBN"
        placeholderTextColor={theme.textSecondary}
        style={[
          globalStyles.modalInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
            marginBottom: 15
          }
        ]}
        value={bookState.isbn}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'isbn', value })}
        maxLength={20}
      />
    </View>
  );
};

export const EditBasicInfo = React.memo(EditBasicInfoComponent);
