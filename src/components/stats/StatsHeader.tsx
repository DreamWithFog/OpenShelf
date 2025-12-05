import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

interface Theme {
  background: string;
  text: string;
  primary: string;
  cardBackground: string;
}

interface StatsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  theme: Theme;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ selectedPeriod, onPeriodChange, theme }) => {
  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' }
  ];

  return (
    <View style={[globalStyles.header, { backgroundColor: theme.background }]}>
      <Text style={[globalStyles.headerTitle, { color: theme.text }]}>
        Reading Statistics
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={{
              backgroundColor: selectedPeriod === period.key ? theme.primary : theme.cardBackground,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.primary,
            }}
            onPress={() => onPeriodChange(period.key)}
          >
            <Text style={{
              color: selectedPeriod === period.key ? '#fff' : theme.text,
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default StatsHeader;
