import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FormatChartProps {
  data: Array<{ label: string; value: number }>;
  theme: any;
}

const FormatChart: React.FC<FormatChartProps> = ({ data, theme }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const getIcon = (format: string) => {
    switch(format.toLowerCase()) {
      case 'physical': return 'book-open-page-variant';
      case 'ebook': return 'tablet'; // FIXED: 'tablet-ipad' -> 'tablet'
      case 'audiobook': return 'headphones';
      default: return 'file-document-outline';
    }
  };

  const getColor = (index: number) => {
    const opacity = Math.max(0.3, 1 - (index * 0.2));
    if (theme.primary.startsWith('#')) {
       const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
       return `${theme.primary}${alpha}`; 
    }
    return theme.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Format Distribution</Text>
      
      <View style={styles.listContainer}>
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const color = getColor(index);
          
          return (
            <View key={index} style={styles.row}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name={getIcon(item.label) as any} size={20} color={theme.text} style={{ marginRight: 8, opacity: 0.8 }} />
                <Text style={{ color: theme.text, fontSize: 14, width: 80 }}>{item.label}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.track, { backgroundColor: theme.border }]}>
                  <View style={[styles.fill, { backgroundColor: color, width: `${percentage}%` }]} />
                </View>
              </View>

              <View style={styles.statsContainer}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.value}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginLeft: 4 }}>({percentage}%)</Text>
              </View>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 60,
  },
});

export default FormatChart;
