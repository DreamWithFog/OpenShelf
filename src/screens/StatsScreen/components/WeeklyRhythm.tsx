import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyActivity } from '../../../utils/statsCalculator';

interface WeeklyRhythmProps {
  data: DailyActivity[];
  theme: any;
}

const WeeklyRhythm: React.FC<WeeklyRhythmProps> = ({ data, theme }) => {
  // Defensive check: If no data, return nothing or a placeholder
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Weekly Rhythm</Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 10 }}>
          No activity recorded yet.
        </Text>
      </View>
    );
  }

  // Find absolute max for scaling the bars (min 1 to avoid div by 0)
  const maxMinutes = Math.max(...data.map(d => d.minutes || 0), 1);

  const getDayLabel = (dateStr: string) => {
    if (!dateStr) return '?';
    // Create date object (append T00:00 to avoid timezone shifts if just YYYY-MM-DD)
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()] || '?';
  };

  // Ensure we usually show 7 bars. If data < 7, we can just show what we have.
  // The sorting is assumed to be chronological from the hook.

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly Rhythm</Text>
      
      <View style={styles.chartContainer}>
        {data.map((day, index) => {
          // Calculate height percentage (capped at 100%)
          const percentage = Math.min(100, Math.round(((day.minutes || 0) / maxMinutes) * 100));
          const height = Math.max(percentage, 4); // Min height 4% so empty bars are visible dots

          return (
            <View key={index} style={styles.barGroup}>
              {/* Bar */}
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${height}%`,
                      backgroundColor: day.minutes > 0 ? theme.primary : theme.border,
                      opacity: day.minutes > 0 ? 1 : 0.3
                    }
                  ]} 
                />
              </View>
              
              {/* Label */}
              <Text style={[
                styles.label, 
                { 
                  color: day.minutes > 0 ? theme.text : theme.textSecondary,
                  fontWeight: day.minutes > 0 ? 'bold' : 'normal'
                }
              ]}>
                {getDayLabel(day.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 5,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  label: {
    fontSize: 12,
  },
});

export default WeeklyRhythm;
