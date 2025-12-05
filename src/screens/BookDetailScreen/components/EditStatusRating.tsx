import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { globalStyles } from '../../../styles/globalStyles';
import { STATUS_OPTIONS } from '../../../constants';
import { Theme } from '../../../context/AppContext';
import { FormState, BookAction } from '../../../types';

interface EditStatusRatingProps {
  bookState: FormState;
  dispatch: React.Dispatch<BookAction>;
  theme: Theme;
}

const EditStatusRatingComponent: React.FC<EditStatusRatingProps> = ({ bookState, dispatch, theme }) => {
  return (
    <View>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10, marginTop: 10 }]}>
        Status
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
        {STATUS_OPTIONS.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => {
              dispatch({ type: 'SET_FIELD', field: 'status', value: status });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: bookState.status === status ? theme.primary : theme.cardBackground,
              borderWidth: 1,
              borderColor: bookState.status === status ? theme.primary : theme.border,
            }}
          >
            <Text style={{
              color: bookState.status === status ? '#fff' : theme.text,
              fontSize: 14,
              fontWeight: bookState.status === status ? 'bold' : 'normal',
            }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>
        Rating
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              dispatch({ type: 'SET_FIELD', field: 'rating', value: star });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons
              name={star <= (bookState.rating || 0) ? 'star' : 'star-outline'}
              size={36}
              color={star <= (bookState.rating || 0) ? '#FFD700' : theme.textSecondary}
              style={{ marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const EditStatusRating = React.memo(EditStatusRatingComponent);
