import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface RecordItem {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
}

interface HallOfFameProps {
  records: RecordItem[];
  theme: Theme;
}

const HallOfFame: React.FC<HallOfFameProps> = ({ records, theme }) => {
  return (
    <View>
      {/* FIX: Center Header Title */}
      <Text style={[styles.headerTitle, { color: theme.text, textAlign: 'center' }]}>
        Hall of Fame
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
      >
        {records.map((record, index) => (
          <View 
            key={index} 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.cardBackground, 
                borderColor: theme.border,
                width: 160 
              }
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15` }]}>
              <MaterialCommunityIcons name={record.icon as any} size={24} color={theme.primary} />
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{record.subtitle}</Text>
              <Text style={[styles.value, { color: theme.primary }]}>{record.value}</Text>
            </View>
            
            <Text 
              style={[styles.bookTitle, { color: theme.text }]} 
              numberOfLines={2}
            >
              {record.title}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingRight: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center', // Center card content
    height: 170,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default HallOfFame;
