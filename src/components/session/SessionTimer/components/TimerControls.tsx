import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../../../context/AppContext';

interface TimerControlsProps {
  isPaused: boolean;
  onPauseResume: () => void;
  onStop: () => void;
  onFocusMode: () => void;
  theme: Theme;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isPaused,
  onPauseResume,
  onStop,
  onFocusMode,
  theme
}) => {
  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPauseResume();
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStop();
  };

  const handleFocusMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFocusMode();
  };

  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        onPress={handleFocusMode}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <MaterialIcons name="fullscreen" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handlePauseResume}
        style={[styles.button, { backgroundColor: isPaused ? theme.success : theme.warning }]}
      >
        <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleStop}
        style={[styles.button, { backgroundColor: theme.danger }]}
      >
        <MaterialIcons name="stop" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default TimerControls;
