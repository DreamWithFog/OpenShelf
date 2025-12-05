import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTimer } from '../../../../utils/helpers';
import { ActiveSession } from '../../../../types';
import { Theme } from '../../../../context/AppContext';

interface TimerDisplayProps {
  seconds: number;
  isPaused: boolean;
  activeSession: ActiveSession;
  theme: Theme;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, isPaused, activeSession, theme }) => {
  return (
    <View style={styles.timerContent}>
      <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
        Reading Session
      </Text>
      <Text style={[styles.timerDisplay, { color: isPaused ? theme.warning : theme.text }]}>
        {formatTimer(seconds)}
      </Text>
      <Text style={[styles.bookTitle, { color: theme.textSecondary }]} numberOfLines={1}>
        {activeSession.bookTitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginVertical: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default TimerDisplay;