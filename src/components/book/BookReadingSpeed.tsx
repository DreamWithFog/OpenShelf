import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReadingSpeedData {
  unitsPerHour: number;
  unitType: 'pages' | 'chapters';
  formattedEstimatedTime: string;
  hasData: boolean;
}

interface BookReadingSpeedProps {
  readingSpeed: ReadingSpeedData;
  theme: { cardBackground: string; primary: string; text: string; textSecondary: string };
}

const BookReadingSpeed: React.FC<BookReadingSpeedProps> = ({ readingSpeed, theme }) => {
  const { unitsPerHour, unitType, formattedEstimatedTime, hasData } = readingSpeed;
  
  // Format the speed label based on unit type
  const speedLabel = unitType === 'chapters' ? 'ch/h' : 'pages/h';
  
  // Format the units per hour (chapters can have decimals)
  const formattedSpeed = unitType === 'chapters' && unitsPerHour % 1 !== 0
    ? unitsPerHour.toFixed(1)
    : unitsPerHour.toString();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <Ionicons name="speedometer-outline" size={20} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Reading Speed</Text>
      </View>
      
      <View style={styles.statsContainer}>
        {hasData ? (
          <View style={styles.statsRow}>
            <View style={styles.statItemCompact}>
              <Text style={[styles.statValueCompact, { color: theme.primary }]}>
                {formattedSpeed}
              </Text>
              <Text style={[styles.statLabelCompact, { color: theme.textSecondary }]}>
                {speedLabel}
              </Text>
            </View>
            
            <Text style={[styles.separator, { color: theme.textSecondary }]}>•</Text>
            
            <View style={styles.statItemCompact}>
              <Text style={[styles.statLabelCompact, { color: theme.textSecondary }]}>
                Est. finish:
              </Text>
              <Text style={[styles.statValueCompact, { color: theme.primary }]}>
                {formattedEstimatedTime}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              Estimated finish time: ?
            </Text>
            <Text style={[styles.noDataHint, { color: theme.textSecondary }]}>
              Start a reading session to track your speed
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValueCompact: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabelCompact: {
    fontSize: 14,
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 12,
  },
  noDataContainer: {
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    marginBottom: 4,
  },
  noDataHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default BookReadingSpeed;