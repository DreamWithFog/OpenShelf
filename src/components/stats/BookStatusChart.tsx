import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatusCounts {
  [key: string]: number;
}

interface Theme {
  cardBackground: string;
  textSecondary: string;
  text: string;
  border: string;
  primary: string;
  dark?: boolean;
}

interface BookStatusChartProps {
  statusCounts: StatusCounts;
  theme: Theme;
}

const adjustColor = (color: string, amount: number): string => {
  const clamp = (num: number) => Math.max(0, Math.min(255, num));
  
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  
  const result = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  return '#' + result;
};

const getStatusColor = (status: string, theme: Theme): string => {
  const isDark = theme.dark || false;
  
  switch (status) {
    case 'Reading':
      return theme.primary;
    case 'Want to Read':
      return isDark ? adjustColor(theme.primary, 60) : adjustColor(theme.primary, -60);
    case 'Finished':
      return isDark ? adjustColor(theme.primary, 40) : adjustColor(theme.primary, -40);
    case 'Unfinished':
      return isDark ? adjustColor(theme.primary, 20) : adjustColor(theme.primary, -20);
    case 'DNF':
      return isDark ? adjustColor(theme.primary, -20) : adjustColor(theme.primary, 60);
    default:
      return theme.textSecondary;
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'Finished':
      return 'check-circle';
    case 'Reading':
      return 'book-open-page-variant';
    case 'Want to Read':
      return 'bookmark-outline';
    case 'Unfinished':
      return 'pause-circle';
    case 'DNF':
      return 'close-circle';
    default:
      return 'help-circle';
  }
};

const BookStatusChart: React.FC<BookStatusChartProps> = ({ statusCounts, theme }) => {
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bookshelf" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No books in your library yet
          </Text>
        </View>
      </View>
    );
  }

  const statusOrder = ['Reading', 'Want to Read', 'Finished', 'Unfinished', 'DNF'];
  
  const statusData = statusOrder
    .filter(status => (statusCounts[status] || 0) > 0)
    .map(status => ({
      status,
      count: statusCounts[status] || 0,
      percentage: ((statusCounts[status] || 0) / total) * 100,
      color: getStatusColor(status, theme),
      icon: getStatusIcon(status)
    }));

  const maxCount = Math.max(...statusData.map(d => d.count));
  const maxBarHeight = 110;

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Books by Status
      </Text>

      <View style={styles.chartContainer}>
        {statusData.map((item) => {
          const barHeightPx = (item.count / maxCount) * maxBarHeight;
          
          return (
            <View key={item.status} style={styles.barColumn}>
              <View style={[styles.barWrapper, { height: maxBarHeight }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: item.color,
                      height: barHeightPx,
                    }
                  ]}
                />
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons 
                  name={item.icon as any} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.badgeCount}>{item.count}</Text>
              </View>
              
              <Text 
                style={[styles.statusLabel, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.status}
              </Text>
              
              <Text style={[styles.statusPercentage, { color: theme.textSecondary }]}>
                {Math.round(item.percentage)}%
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.totalContainer, { borderTopColor: theme.border }]}>
        <Text style={[styles.totalText, { color: theme.textSecondary }]}>
          Total: {total} {total === 1 ? 'book' : 'books'}
        </Text>
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
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 70,
  },
  barWrapper: {
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    minHeight: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    marginBottom: 4,
  },
  badgeCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    minHeight: 24,
    paddingHorizontal: 2,
  },
  statusPercentage: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  totalContainer: {
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});

export default BookStatusChart;
