import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { Theme } from '../../../context/AppContext';
import { FormState } from '../../../types';

interface EditFormatLanguageProps {
  bookState: FormState;
  theme: Theme;
  onShowFormatPicker: () => void;
  onShowLanguagePicker: () => void;
  onShowOriginalLanguagePicker: () => void;
  onShowTrackingPicker: () => void;
}

const EditFormatLanguageComponent: React.FC<EditFormatLanguageProps> = ({
  bookState,
  theme,
  onShowFormatPicker,
  onShowLanguagePicker,
  onShowOriginalLanguagePicker,
  onShowTrackingPicker
}) => {
  return (
    <View>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10, marginTop: 10 }]}>
        Format & Language
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: theme.inputBackground,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={onShowFormatPicker}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Format: {bookState.format || 'Physical'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.inputBackground,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={onShowLanguagePicker}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Language: {bookState.language || 'English'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.inputBackground,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={onShowOriginalLanguagePicker}
      >
        <Text style={{
          color: bookState.originalLanguage ? theme.text : theme.textSecondary,
          fontSize: 16
        }}>
          {bookState.originalLanguage
            ? `Original: ${bookState.originalLanguage}`
            : 'Original Language (if translated)'
          }
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.inputBackground,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={onShowTrackingPicker}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Tracking: {bookState.trackingType === 'pages' ? 'Pages' : 'Chapters'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

export const EditFormatLanguage = React.memo(EditFormatLanguageComponent);
