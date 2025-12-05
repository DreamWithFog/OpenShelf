import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../../styles/globalStyles';
import { COLLECTION_TYPES } from '../../../constants';
import { Theme } from '../../../context/AppContext';
import { FormState, BookAction } from '../../../types';

interface EditSeriesInfoProps {
  bookState: FormState;
  dispatch: React.Dispatch<BookAction>;
  theme: Theme;
}

const EditSeriesInfoComponent: React.FC<EditSeriesInfoProps> = ({ bookState, dispatch, theme }) => {
  const [showCollectionTypePicker, setShowCollectionTypePicker] = useState(false);

  const handleCollectionTypeChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'collectionType', value });
    setShowCollectionTypePicker(false);

    // Clear fields when switching to standalone
    if (value === 'standalone') {
      dispatch({ type: 'SET_FIELD', field: 'seriesName', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'seriesOrder', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'volumeNumber', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'totalVolumes', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'totalInSeries', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'seriesCoverUrl', value: '' });
    }
  };

  return (
    <View>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10, marginTop: 10 }]}>
        Series/Collection Information
      </Text>

      {/* Collection Type Picker */}
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
        onPress={() => setShowCollectionTypePicker(true)}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Type: {COLLECTION_TYPES.find((t) => t.value === bookState.collectionType)?.label || 'Standalone Book'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Collection Type Picker Modal */}
      <Modal
        visible={showCollectionTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCollectionTypePicker(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          activeOpacity={1}
          onPress={() => setShowCollectionTypePicker(false)}
        >
          <View
            style={{
              width: '85%',
              maxHeight: '70%',
              backgroundColor: theme.cardBackground,
              borderRadius: 20,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.text,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Select Collection Type
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {COLLECTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={{
                    backgroundColor: bookState.collectionType === type.value
                      ? theme.primary
                      : theme.inputBackground,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                  onPress={() => handleCollectionTypeChange(type.value)}
                >
                  <Text style={{
                    color: bookState.collectionType === type.value
                      ? '#fff'
                      : theme.text,
                    fontSize: 16,
                    fontWeight: bookState.collectionType === type.value ? 'bold' : 'normal'
                  }}>
                    {type.label}
                  </Text>
                  {type.description && (
                    <Text style={{
                      color: bookState.collectionType === type.value
                        ? 'rgba(255,255,255,0.8)'
                        : theme.textSecondary,
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      {type.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                padding: 16,
                marginTop: 16,
                alignItems: 'center',
              }}
              onPress={() => setShowCollectionTypePicker(false)}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Series/Collection Fields - Only show when NOT standalone */}
      {bookState.collectionType !== 'standalone' && (
        <>
          <TextInput
            placeholder={
              bookState.collectionType === 'volume'
                ? "Series/Manga Name"
                : bookState.collectionType === 'collection'
                  ? "Collection Name"
                  : "Series Name"
            }
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.modalInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
                marginBottom: 15,
                textAlign: 'left',
              }
            ]}
            value={bookState.seriesName}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'seriesName', value })}
            maxLength={300}
          />

          {/* Volume Number Fields - Only for volumes */}
          {bookState.collectionType === 'volume' ? (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <TextInput
                placeholder="Volume #"
                placeholderTextColor={theme.textSecondary}
                style={[
                  globalStyles.modalInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                    flex: 1,
                    textAlign: 'left',
                  }
                ]}
                value={bookState.volumeNumber}
                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'volumeNumber', value })}
                keyboardType="numeric"
                maxLength={6}
              />
              <TextInput
                placeholder="of (Total)"
                placeholderTextColor={theme.textSecondary}
                style={[
                  globalStyles.modalInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                    flex: 1,
                    textAlign: 'left',
                  }
                ]}
                value={bookState.totalVolumes}
                onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalVolumes', value })}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          ) : (
            // Series Order Field - Only for series/collections
            <TextInput
              placeholder="Book # in Series (e.g., 1, 2.5, 3)"
              placeholderTextColor={theme.textSecondary}
              style={[
                globalStyles.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.text,
                  marginBottom: 15,
                  textAlign: 'left',
                }
              ]}
              value={bookState.seriesOrder}
              onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'seriesOrder', value })}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          )}

          {/* Total in Series - For all collection types */}
          <TextInput
            placeholder={
              bookState.collectionType === 'volume'
                ? "Total Volumes in Series (optional)"
                : "Total Books in Series (optional)"
            }
            placeholderTextColor={theme.textSecondary}
            style={[
              globalStyles.modalInput,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
                marginBottom: 15,
                textAlign: 'left',
              }
            ]}
            value={bookState.totalInSeries}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'totalInSeries', value })}
            keyboardType="numeric"
            maxLength={6}
          />
        </>
      )}
    </View>
  );
};

export const EditSeriesInfo = React.memo(EditSeriesInfoComponent);
