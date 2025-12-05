import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../../context/AppContext';

interface DailyPulseProps {
  todayValue: number;
  todayUnit: string;
  todayMinutes: number;
  message: string;
  theme: Theme;
}

const DailyPulse: React.FC<DailyPulseProps> = ({ todayValue, todayUnit, todayMinutes, message, theme }) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' }}>
        <MaterialCommunityIcons name="heart-pulse" size={20} color="rgba(255,255,255,0.9)" style={{ marginRight: 8 }} />
        <Text style={styles.header}>DAILY PULSE</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.value}>{todayValue}</Text>
          <Text style={styles.unit}>{todayUnit}</Text>
        </View>
        <View style={{ width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.value}>{todayMinutes}</Text>
          <Text style={styles.unit}>minutes</Text>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>"{message}"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  unit: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: -4,
  },
  messageContainer: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default DailyPulse;
