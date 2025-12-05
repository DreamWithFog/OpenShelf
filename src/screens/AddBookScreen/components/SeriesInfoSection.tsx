import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { COLLECTION_TYPES } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface FormState {
  collectionType: string;
  seriesName: string;
  volumeNumber: string;
  totalVolumes: string;
  seriesOrder: string;
}

interface SeriesInfoSectionProps {
  formState: FormState;
  dispatch: React.Dispatch<any>;
  theme: Theme;
  onOpenCollectionTypePicker: () => void;
}

const SeriesInfoSection: React.FC<SeriesInfoSectionProps> = ({ 
  formState, 
  dispatch, 
  theme, 
  onOpenCollectionTypePicker 
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Series/Collection Information
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
        onPress={onOpenCollectionTypePicker}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Type: {COLLECTION_TYPES.find(t => t.value === formState.collectionType)?.label || 'Standalone Book'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      {formState.collectionType !== 'standalone' && (
        <>
          <TextInput 
            placeholder={
              formState.collectionType === 'volume' 
                ? "Series/Manga Name" 
                : formState.collectionType === 'collection'
                ? "Collection/Anthology Name"
                : "Series Name"
            } 
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.input,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border, 
                color: theme.text,
                marginBottom: 15
              }
            ]} 
            value={formState.seriesName} 
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'seriesName', value })} 
            maxLength={300}
          />

          {formState.collectionType === 'volume' ? (
            <View style={{ marginBottom: 15 }}>
              <TextInput 
                placeholder="Volume Number (e.g., 3)" 
                placeholderTextColor={theme.textSecondary}
                style={[
                  globalStyles.input,
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border, 
                    color: theme.text,
                    marginBottom: 15
                  }
                ]} 
                value={formState.volumeNumber} 
                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'volumeNumber', value })} 
                keyboardType="numeric"
                maxLength={6}
              />
              
              <TextInput 
                placeholder="Total Volumes (optional, e.g., 12)" 
                placeholderTextColor={theme.textSecondary}
                style={[
                  globalStyles.input,
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border, 
                    color: theme.text,
                  }
                ]} 
                value={formState.totalVolumes} 
                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalVolumes', value })} 
                keyboardType="numeric"
                maxLength={6}
              />
              
              <Text style={{ 
                color: theme.textSecondary, 
                fontSize: 12, 
                marginTop: 6,
                marginLeft: 4
              }}>
                Leave total blank if the series is ongoing
              </Text>
            </View>
          ) : (
            <TextInput 
              placeholder="Book # in Series/Collection (e.g., 1, 21, 2.5, 3)" 
              placeholderTextColor={theme.textSecondary}
              style={[
                globalStyles.input,
                { 
                  backgroundColor: theme.inputBackground, 
                  borderColor: theme.border, 
                  color: theme.text,
                  marginBottom: 15
                }
              ]} 
              value={formState.seriesOrder} 
              onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'seriesOrder', value })} 
              keyboardType="decimal-pad"
              maxLength={10}
            />
          )}
        </>
      )}
    </View>
  );
};

export default SeriesInfoSection;
