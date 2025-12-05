import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCounter } from '../common';
import { formatTotalTime } from '../../utils/helpers';
import { StatsResult } from '../../utils/statsCalculator';

interface Theme {
  primary: string;
  background: string;
  border: string;
  text: string;
  textSecondary: string;
  cardBackground: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  theme: Theme;
  isTime?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, theme, isTime = false }) => (
  <View style={{
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  }}>
    <Text style={{ 
      color: theme.textSecondary, 
      fontSize: 13, 
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }}>
      {title}
    </Text>
    
    <AnimatedCounter 
      value={value} 
      formatter={isTime ? formatTotalTime : undefined}
      style={{ 
        color: theme.text, 
        fontSize: 22, 
        fontWeight: 'bold',
        textAlign: 'center'
      }} 
    />
  </View>
);

// Update interface to use the new StatsResult
interface StatsCardsProps {
  stats: StatsResult; // Use the full object instead of a partial subset
  theme: Theme;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, theme }) => {
  
  // Dynamic Labels based on Primary Unit
  const isChapters = stats.primaryUnit === 'chapters';
  const volumeLabel = isChapters ? 'Chapters Read' : 'Pages Read';
  const volumeValue = isChapters ? stats.totalChaptersRead : stats.totalPagesRead;

  const statItems = [
    { title: 'Current Streak', value: stats.currentStreak, isTime: false },
    { title: 'Books Read', value: stats.booksFinished, isTime: false },
    { title: volumeLabel, value: volumeValue, isTime: false }, // DYNAMIC
    { title: 'Sessions', value: stats.totalSessions, isTime: false },
    { title: 'Reading Time', value: stats.totalReadingTime, isTime: true },
    { title: 'Avg Session', value: stats.averageSessionTime, isTime: true },
  ];

  return (
    <View style={{ 
      padding: 16, 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between' 
    }}>
      {statItems.map((item, index) => (
        <StatsCard
          key={index}
          title={item.title}
          value={item.value}
          isTime={item.isTime}
          theme={theme}
        />
      ))}
    </View>
  );
};

export default StatsCards;
