import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface SeriesHeaderProps {
  seriesName: string;
  bookCount: number;
  onBack: () => void;
  theme: Theme;
}

export const SeriesHeader: React.FC<SeriesHeaderProps> = ({ seriesName, bookCount, onBack, theme }) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
    }}>
      <TouchableOpacity
        onPress={onBack}
        style={{ marginRight: 12 }}
      >
        <MaterialIcons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: theme.text,
        }}>
          {seriesName}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {bookCount} {bookCount === 1 ? 'book' : 'books'}
        </Text>
      </View>
    </View>
  );
};
