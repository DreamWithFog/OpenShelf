import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { globalStyles } from '../../../styles/globalStyles';
import { STATUS_OPTIONS } from '../../../constants';
import { Theme } from '../../../context/AppContext';

interface FormState {
  status: string;
}

interface StatusSectionProps {
  formState: FormState;
  dispatch: React.Dispatch<any>; // TODO: Refine dispatch type
  theme: Theme;
}

const StatusSection: React.FC<StatusSectionProps> = ({ formState, dispatch, theme }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[globalStyles.subtitle, { color: theme.text, marginBottom: 10 }]}>Status:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
              backgroundColor: formState.status === status ? theme.primary : theme.cardBackground,
              borderWidth: 1,
              borderColor: formState.status === status ? theme.primary : theme.border,
            }}
          >
            <Text style={{
              color: formState.status === status ? '#fff' : theme.text,
              fontSize: 14,
              fontWeight: formState.status === status ? 'bold' : 'normal',
            }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default StatusSection;