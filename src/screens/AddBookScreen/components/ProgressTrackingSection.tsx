import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles } from '../../../styles/globalStyles';
import { TRACKING_TYPES } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface FormState {
  trackingType: string;
  totalPages: string;
  currentPage: string;
  totalChapters: string;
  currentChapter: string;
}

interface ProgressTrackingSectionProps {
  formState: FormState;
  dispatch: React.Dispatch<any>;
  theme: Theme;
  onShowTrackingPicker: () => void;
}

const ProgressTrackingSection: React.FC<ProgressTrackingSectionProps> = ({ 
  formState, 
  dispatch, 
  theme, 
  onShowTrackingPicker 
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Progress Tracking
      </Text>

      {/* Tracking Type Picker */}
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
          Track by: {TRACKING_TYPES.find(t => t.value === formState.trackingType)?.label || 'Pages'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Conditional inputs based on tracking type */}
      {formState.trackingType === 'pages' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput 
            placeholder="Total Pages" 
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.input,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border, 
                color: theme.text,
                flex: 1
              }
            ]} 
            value={formState.totalPages} 
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalPages', value })} 
            keyboardType="numeric" 
            maxLength={6}
          />

          <TextInput 
            placeholder="Current Page" 
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.input,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border, 
                color: theme.text,
                flex: 1
              }
            ]} 
            value={formState.currentPage} 
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'currentPage', value })} 
            keyboardType="numeric" 
            maxLength={6}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput 
            placeholder="Total Chapters" 
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.input,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border, 
                color: theme.text,
                flex: 1
              }
            ]} 
            value={formState.totalChapters} 
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalChapters', value })} 
            keyboardType="numeric" 
            maxLength={6}
          />

          <TextInput 
            placeholder="Current Chapter" 
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.input,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border, 
                color: theme.text,
                flex: 1
              }
            ]} 
            value={formState.currentChapter} 
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'currentChapter', value })} 
            keyboardType="numeric" 
            maxLength={6}
          />
        </View>
      )}
    </View>
  );
};

export default ProgressTrackingSection;
