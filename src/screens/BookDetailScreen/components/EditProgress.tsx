import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';
import { FormState, BookAction } from '../../../types';

interface EditProgressProps {
  bookState: FormState;
  dispatch: React.Dispatch<BookAction>;
  theme: Theme;
}

const EditProgressComponent: React.FC<EditProgressProps> = ({ bookState, dispatch, theme }) => {
  return (
    <View>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10, marginTop: 10 }]}>
        Progress
      </Text>

      {bookState.trackingType === 'pages' ? (
        <TextInput
          placeholder="Total Pages"
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
          value={bookState.totalPages}
          onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalPages', value })}
          keyboardType="numeric"
          maxLength={6}
        />
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
          <TextInput
            placeholder="Total Chapters"
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.modalInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
                flex: 1
              }
            ]}
            value={bookState.totalChapters}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalChapters', value })}
            keyboardType="numeric"
            maxLength={6}
          />

          <TextInput
            placeholder="Current"
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.modalInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
                flex: 1
              }
            ]}
            value={bookState.currentChapter}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'currentChapter', value })}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      )}

      <TextInput
        placeholder="Book URL (https://)"
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
        value={bookState.bookUrl}
        onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'bookUrl', value })}
        keyboardType="url"
        autoCapitalize="none"
        maxLength={1000}
      />
    </View>
  );
};

export const EditProgress = React.memo(EditProgressComponent);
